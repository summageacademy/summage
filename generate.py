import matplotlib.pyplot as plt
import numpy as np
import random
import os
from PIL import Image
import io

# ================== CONFIG ==================
TOTAL_IMAGES = 50
MAX_SIZE_KB = 480
OUTPUT_FOLDER = "ielts_task1_pro"

os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# Wide professional color palette
COLOR_PALETTE = [
    '#06a87c', '#f24b0b', '#3498db', '#9b59b6', '#e67e22', '#2ecc71',
    '#e74c3c', '#1abc9c', '#2980b9', '#8e44ad', '#f39c12', '#d35400',
    '#27ae60', '#c0392b', '#16a085', '#34495e', '#7f8c8d', '#f1c40f',
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeead', '#ff9ff3'
]

topics = [
    "international tourism arrivals", "renewable energy consumption", "electric vehicle sales",
    "online shopping expenditure", "university enrollment rates", "carbon dioxide emissions",
    "average house prices", "internet users per 100 people", "fast food consumption",
    "mobile phone ownership", "public transport usage", "waste recycling rates",
    "coffee consumption", "air passenger numbers", "foreign direct investment",
    "smartphone market share", "annual rainfall", "unemployment rates",
    "healthcare expenditure", "e-commerce revenue", "solar power generation",
    "youth literacy rates", "tourist spending", "pet ownership", "electricity consumption"
]

def get_realistic_line_data(num_lines=3, num_points=6):
    """Generate diverse realistic line data with different year ranges"""
    year_options = [
        ['2015','2016','2017','2018','2019','2020'],
        ['2016','2017','2018','2019','2020','2021'],
        ['2017','2018','2019','2020','2021','2022'],
        ['2018','2019','2020','2021','2022','2023'],
        ['2019','2020','2021','2022','2023','2024']
    ]
    
    years = random.choice(year_options)
    
    base_trend = np.linspace(random.randint(25, 65), random.randint(75, 155), num_points)
    datasets = []
    
    for _ in range(num_lines):
        noise = np.random.normal(0, random.uniform(5, 14), num_points)
        trend_multiplier = random.uniform(0.7, 1.45)
        values = np.round(base_trend * trend_multiplier + noise).astype(int)
        values = np.clip(values, 5, 195)
        datasets.append(values)
    
    return years, datasets

def get_realistic_bar_data(num_bars=5):
    """Generate diverse bar data"""
    base = np.random.randint(28, 98, num_bars)
    variation = np.random.normal(0, 13, num_bars)
    values = np.round(base + variation).astype(int)
    return np.clip(values, 8, 165)

def generate_prompt(graph_type, topic, years=None):
    if graph_type == "line":
        return f"The line graph below shows {topic} in different countries/regions from {years[0]} to {years[-1]}.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant."
    else:  # bar
        year = random.choice(['2021', '2022', '2023', '2024'])
        return f"The bar chart below shows {topic} across several categories in {year}.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant."

def save_as_webp(fig, filepath, quality=88):
    buf = io.BytesIO()
    fig.savefig(buf, format='png', dpi=240, bbox_inches='tight', facecolor='white', pad_inches=0.15)
    buf.seek(0)
    img = Image.open(buf).convert('RGB')
    img.save(filepath, 'WEBP', quality=quality, method=6)
    return os.path.getsize(filepath) / 1024

def create_professional_graph(index):
    graph_type = random.choice(["line", "bar"])
    topic = random.choice(topics)
    
    plt.figure(figsize=(12.8, 8.2))
    
    if graph_type == "line":
        num_lines = random.randint(2, 4)
        years, datasets = get_realistic_line_data(num_lines=num_lines)
        labels = [f"Region {chr(65+i)}" for i in range(num_lines)]
        colors = random.sample(COLOR_PALETTE, num_lines)
        
        for i, data in enumerate(datasets):
            plt.plot(years, data, marker='o', linewidth=3.3, markersize=7.5,
                     color=colors[i], label=labels[i])
        
        plt.title(f"{topic.replace('_', ' ').title()}", fontsize=16.5, pad=28, color='#1f2937')
        plt.xlabel("Year", fontsize=13)
        plt.ylabel("Value", fontsize=13)
        plt.legend(fontsize=11.5, frameon=True, facecolor='white', edgecolor='#e5e7eb')
        plt.grid(True, alpha=0.32, linestyle='--')
        
    else:  # bar
        num_bars = random.randint(4, 7)
        categories = [f"Category {chr(65+i)}" for i in range(num_bars)]
        
        # Sometimes use real city/country names
        if random.random() > 0.55:
            categories = random.sample([
                'London', 'New York', 'Tokyo', 'Paris', 'Sydney', 'Dubai', 
                'Berlin', 'Singapore', 'Seoul', 'Mumbai', 'Moscow', 'Cairo'
            ], min(num_bars, 8))
        
        values = get_realistic_bar_data(num_bars)
        colors = random.sample(COLOR_PALETTE, num_bars)
        
        plt.bar(categories, values, color=colors, alpha=0.95, edgecolor='black', linewidth=0.7)
        plt.title(f"{topic.replace('_', ' ').title()}", fontsize=16.5, pad=28, color='#1f2937')
        plt.ylabel("Percentage / Million / Units", fontsize=13)
        plt.xticks(rotation=15 if num_bars > 5 else 10, fontsize=11.5)
        plt.grid(axis='y', alpha=0.3)
    
    # Save image
    webp_path = f"{OUTPUT_FOLDER}/task1_{index:03d}.webp"
    size_kb = save_as_webp(plt.gcf(), webp_path)
    
    if size_kb > MAX_SIZE_KB:
        size_kb = save_as_webp(plt.gcf(), webp_path, quality=70)
    
    plt.close()
    
    # Save prompt
    prompt = generate_prompt(graph_type, topic, years if graph_type == "line" else None)
    with open(f"{OUTPUT_FOLDER}/task1_{index:03d}_prompt.txt", "w", encoding="utf-8") as f:
        f.write(prompt)
    
    print(f"✅ {index:02d}/50 | {graph_type.upper():4} | {size_kb:.1f}KB | {topic[:48]:48}")

# ================== RUN ==================
print("🚀 Generating 50 Diverse Professional IELTS Task 1 Images...\n")

random.seed(42)   # For reproducibility

for i in range(1, TOTAL_IMAGES + 1):
    create_professional_graph(i)

print(f"\n🎉 Generation Complete! Files saved in '{OUTPUT_FOLDER}' folder.")