from dataclasses import dataclass, field
from typing import Dict, Any, List, Optional
from datetime import datetime


@dataclass
class InventoryContext:
    product_id: int

    # product
    sku: Optional[str] = None
    name: Optional[str] = None
    category: Optional[str] = None

    # core state
    current_stock: float = 0

    # phase outputs
    forecast: Dict[str, Any] = field(default_factory=dict)
    decision: Dict[str, Any] = field(default_factory=dict)

    # risk (0–1 system)
    risk: Dict[str, Any] = field(default_factory=dict)

    # phase 3
    explanation: Optional[str] = None

    # phase 6
    alerts: List[Dict[str, Any]] = field(default_factory=list)

    # system metadata
    metadata: Dict[str, Any] = field(default_factory=lambda: {
        "pipeline_version": "v1.0",
        "created_at": datetime.utcnow().isoformat(),
        "model": "prophet_v1"
    })