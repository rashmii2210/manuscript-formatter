"""
Agentic Manuscript Formatter - Agents Package
This file exposes the core functionalities of the specialized agents.
"""

from .parser import parse_document
from .citation_checker import analyze_structure
from .rule_engine import get_formatting_rules
from .formatter import build_latex
from .explainer import generate_explanations

__all__ = [
    "parse_document",
    "analyze_structure",
    "get_formatting_rules",
    "build_latex",
    "generate_explanations"
]