#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate CSV import templates for customers / motorcycles / products (public/csv-templates)."""
import csv, io
from pathlib import Path

OUT = Path("/Users/Jun/Documents/CRM-D&Z/public/csv-templates")
OUT.mkdir(parents=True, exist_ok=True)

def write(name, headers, rows):
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(headers)
    for r in rows:
        w.writerow(r)
    (OUT / name).write_text(buf.getvalue(), encoding="utf-8")
    print("wrote", name, len(rows), "example rows")

write("customers.csv",
    ["name", "phone", "email", "address", "tags", "notes"],
    [
        ["Ahmad Faizal", "012-345 6789", "ahmad@example.com", "12 Jalan Merdeka, KL", "VIP, MEMBER", "Prefers WhatsApp"],
        ["Siti Nurhaliza", "013-222 3344", "siti@example.com", "8 Jalan Ampang, KL", "NEW", ""],
        ["Tan Wei Ming", "016-987 6543", "tan.weiming@example.com", "45 Jalan Johor, JB", "", "Bought Yamaha 2025"],
    ])

write("motorcycles.csv",
    ["customerPhone", "brand", "model", "year", "plate", "vin", "engineNo", "color", "type", "currentMileage"],
    [
        ["012-345 6789", "Yamaha", "Y15ZR", "2023", "WXY 8812", "MHMY15ZR123456", "E3B1-001234", "Black", "SPORT", "31800"],
        ["012-345 6789", "Honda", "EX5 Dream", "2021", "WUL 2419", "MH1EX5123456", "HC05-99887", "Red", "UNDERBONE", "15098"],
        ["013-222 3344", "Modenas", "Kriss 110", "2024", "JKL 8877", "", "", "Blue", "UNDERBONE", "5200"],
    ])

write("products.csv",
    ["sku", "name", "category", "brand", "unit", "sellPrice", "costPrice", "minStock", "safetyStock", "leadTimeDays", "barcode", "manufacturerPartNo", "compatibleModels", "supplierName"],
    [
        ["OIL-4T-10W40", "Engine Oil 4T 10W-40 1L", "LUBRICANTS", "Shell", "unit", "35.00", "22.00", "20", "10", "3", "9551234567890", "550052491", '["SPORT","UNDERBONE","SCOOTER"]', "Shell Malaysia"],
        ["FILTER-OIL-01", "Oil Filter Y15ZR", "FILTERS", "Yamaha", "unit", "25.00", "12.00", "15", "8", "5", "8991234567890", "3B7-13440-00", '["SPORT"]', "Hong Leong Yamaha"],
        ["CHAIN-RK-428", "RK 428 Chain Kit", "DRIVETRAIN", "RK", "set", "89.00", "55.00", "8", "4", "7", "", "", '["SPORT","UNDERBONE"]', ""],
    ])

print("all templates written to", OUT)
