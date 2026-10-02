"""Security Guardrails and SSRF Defense for Web Research."""

import ipaddress
import re
import socket
from typing import Optional, Tuple
import urllib.parse

from chemistry_llm.rag.security.prompt_defense import PromptInjectionDefense

BLOCKED_IP_NETWORKS = [
    ipaddress.ip_network("127.0.0.0/8"),      # Loopback
    ipaddress.ip_network("10.0.0.0/8"),       # Private class A
    ipaddress.ip_network("172.16.0.0/12"),    # Private class B
    ipaddress.ip_network("192.168.0.0/16"),   # Private class C
    ipaddress.ip_network("169.254.0.0/16"),   # Link-local / Cloud metadata (AWS, GCP, Azure)
    ipaddress.ip_network("0.0.0.0/8"),        # Current network
    ipaddress.ip_network("::1/128"),          # IPv6 loopback
    ipaddress.ip_network("fc00::/7"),         # IPv6 unique local
    ipaddress.ip_network("fe80::/10"),        # IPv6 link-local
]

FORBIDDEN_HOSTNAMES = {"localhost", "metadata.google.internal", "instance-data"}


class WebResearchSecurity:
    """Protects server from SSRF and defends against malicious web page content."""

    @classmethod
    def validate_url_safe(cls, url: str) -> Tuple[bool, str]:
        """Validate URL to ensure it does not target internal services or loopback (SSRF protection)."""
        if not url:
            return False, "URL cannot be empty."

        try:
            parsed = urllib.parse.urlparse(url)
            scheme = (parsed.scheme or "").lower()
            if scheme not in ("http", "https"):
                return False, f"Disallowed URL scheme: '{scheme}'. Only http and https permitted."

            hostname = (parsed.hostname or "").lower()
            if not hostname:
                return False, "URL hostname is missing."

            if hostname in FORBIDDEN_HOSTNAMES:
                return False, f"Access to forbidden hostname '{hostname}' is blocked."

            # Check if hostname is an IP literal
            try:
                ip = ipaddress.ip_address(hostname)
                for net in BLOCKED_IP_NETWORKS:
                    if ip in net:
                        return False, f"Access to private/internal IP range ({ip}) is blocked (SSRF Protection)."
            except ValueError:
                # Hostname is a domain name; resolve IP to prevent DNS rebinding SSRF
                try:
                    resolved_ip_str = socket.gethostbyname(hostname)
                    resolved_ip = ipaddress.ip_address(resolved_ip_str)
                    for net in BLOCKED_IP_NETWORKS:
                        if resolved_ip in net:
                            return False, f"Domain '{hostname}' resolves to private IP ({resolved_ip}). Access blocked (SSRF Protection)."
                except Exception:
                    # DNS resolution failed or offline mode
                    pass

            return True, "URL is safe for outbound scientific retrieval."

        except Exception as e:
            return False, f"Invalid URL structure: {e}"

    @classmethod
    def sanitize_web_snippet(cls, snippet: str) -> str:
        """Sanitize web snippet against prompt-injection and malicious scripts."""
        return PromptInjectionDefense.sanitize_untrusted_content(snippet)
