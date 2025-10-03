#!/usr/bin/env python3
"""
Script para gerar ícones PWA em diferentes tamanhos
"""
from PIL import Image, ImageDraw
import os

def create_icon(size, output_path):
    """Cria um ícone com o tamanho especificado"""
    # Criar imagem com gradiente
    img = Image.new('RGBA', (size, size), (19, 16, 59, 255))  # #13103b
    draw = ImageDraw.Draw(img)
    
    # Gradiente manual (simplificado)
    for y in range(size):
        alpha = y / size
        r = int(19 + (212 - 19) * alpha)  # 19 -> 212 (d4)
        g = int(16 + (252 - 16) * alpha)  # 16 -> 252 (fc)  
        b = int(59 + (4 - 59) * alpha)    # 59 -> 4 (04)
        color = (r, g, b, 255)
        draw.line([(0, y), (size, y)], fill=color)
    
    # Desenhar símbolo de medição
    center = size // 2
    radius = size // 8
    
    # Círculo principal
    draw.ellipse([center - radius, center - radius*0.7, 
                  center + radius, center + radius*0.7], 
                 outline=(255, 255, 255, 255), width=max(2, size//64))
    
    # Linhas de medição
    line_width = max(1, size//64)
    draw.rectangle([center - radius//2, center - radius*0.8, 
                   center + radius//2, center - radius*0.8 + line_width], 
                   fill=(255, 255, 255, 255))
    draw.rectangle([center - line_width//2, center - radius*0.8, 
                   center + line_width//2, center - radius*0.3], 
                   fill=(255, 255, 255, 255))
    
    # Base do instrumento
    base_height = size // 4
    base_width = size // 3
    draw.rectangle([center - base_width//2, center + radius//2,
                   center + base_width//2, center + radius//2 + base_height],
                   fill=(255, 255, 255, 255))
    
    # Detalhes da base
    detail_height = max(1, size//64)
    for i in range(4):
        y_pos = center + radius//2 + (i + 1) * base_height//6
        draw.rectangle([center - base_width//3, y_pos,
                       center + base_width//3, y_pos + detail_height],
                       fill=(19, 16, 59, 255))
    
    # Salvar
    img.save(output_path, 'PNG')
    print(f"Ícone criado: {output_path} ({size}x{size})")

def main():
    """Função principal"""
    icons_dir = "client/public"
    os.makedirs(icons_dir, exist_ok=True)
    
    # Criar ícones em diferentes tamanhos
    sizes = [16, 32, 48, 72, 96, 144, 192, 256, 384, 512]
    
    for size in sizes:
        output_path = f"{icons_dir}/icon-{size}.png"
        create_icon(size, output_path)
    
    # Criar favicon
    create_icon(32, f"{icons_dir}/favicon.png")
    print("\n✅ Todos os ícones foram criados com sucesso!")

if __name__ == "__main__":
    main()