import sys
import math
from pathlib import Path
import numpy as np
from PIL import Image

def process_mascot_normalized(
    input_path: str,
    output_path: str,
    target_canvas_size: int = 640,
    target_body_height: int = 400,
    baseline_y: int = 560,
    chroma_threshold: float = 95.0,
    edge_zone_width: float = 50.0
):
    """
    1. Chroma-key magenta (#FF00FF) with soft anti-aliased edge & despill.
    2. Detect core mascot body height (phone top bezel to feet).
    3. Normalize scale so character body height is uniform across all screens.
    4. Anchor feet to a shared ground baseline_y and center horizontally.
    """
    img = Image.open(input_path).convert("RGBA")
    arr = np.array(img, dtype=np.float32)
    h, w = arr.shape[:2]

    # 1. Distance to pure magenta (255, 0, 255)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    dist = np.sqrt((r - 255.0) ** 2 + g ** 2 + (b - 255.0) ** 2)

    bg_mask = dist < chroma_threshold
    edge_zone = (dist >= chroma_threshold) & (dist < chroma_threshold + edge_zone_width)

    alpha = np.ones((h, w), dtype=np.uint8) * 255
    alpha[bg_mask] = 0

    norm_edge = (dist[edge_zone] - chroma_threshold) / edge_zone_width
    alpha[edge_zone] = np.clip(norm_edge * 255.0, 0, 255).astype(np.uint8)

    # Despill magenta fringe on semi-transparent edge pixels
    res = np.array(img)
    semi = (alpha > 0) & (alpha < 245)
    if np.any(semi):
        semi_r = res[:, :, 0][semi].astype(np.float32)
        semi_g = res[:, :, 1][semi].astype(np.float32)
        semi_b = res[:, :, 2][semi].astype(np.float32)
        avg_rb = (semi_r + semi_b) / 2.0
        excess = np.maximum(0.0, avg_rb - np.maximum(semi_g, 80.0)) * 0.75
        res[:, :, 0][semi] = np.clip(semi_r - excess, 0, 255).astype(np.uint8)
        res[:, :, 2][semi] = np.clip(semi_b - excess, 0, 255).astype(np.uint8)

    res[:, :, 3] = alpha
    cleaned_img = Image.fromarray(res, "RGBA")

    # 2. Detect core mascot body bounds (phone top & feet bottom)
    fg = alpha > 40
    col_start, col_end = int(w * 0.28), int(w * 0.72)
    central_fg = fg[:, col_start:col_end]
    col_counts = np.sum(central_fg, axis=1)

    min_row_width = int((col_end - col_start) * 0.35)
    body_rows = np.nonzero(col_counts >= min_row_width)[0]
    all_fg_ys, all_fg_xs = np.nonzero(fg)

    if len(all_fg_ys) == 0:
        cleaned_img.save(output_path, "PNG")
        return

    # Mascot phone top: first row where wide phone chassis starts
    # (skipping thin antennae, ears, or high props if needed, but keeping phone frame)
    phone_top = int(body_rows.min()) if len(body_rows) > 0 else int(all_fg_ys.min())
    
    # Feet bottom: bottom-most row of feet in the central column
    central_ys = np.nonzero(col_counts > 0)[0]
    feet_bottom = int(central_ys.max()) if len(central_ys) > 0 else int(all_fg_ys.max())

    body_height = max(50, feet_bottom - phone_top)
    
    # Body center X: median of X coordinates in the central phone body rows
    body_mid_y = (phone_top + feet_bottom) // 2
    body_ys_slice = fg[body_mid_y - 30 : body_mid_y + 30, :]
    mid_ys, mid_xs = np.nonzero(body_ys_slice)
    body_center_x = float(np.median(mid_xs)) if len(mid_xs) > 0 else w / 2.0

    # 3. Calculate uniform scaling factor based on character body height
    scale = float(target_body_height) / float(body_height)

    # Check overall bbox to ensure props don't clip outside canvas bounds
    overall_x0, overall_x1 = int(all_fg_xs.min()), int(all_fg_xs.max())
    overall_y0, overall_y1 = int(all_fg_ys.min()), int(all_fg_ys.max())

    total_w = overall_x1 - overall_x0
    total_h = overall_y1 - overall_y0

    # If scaled total dimensions exceed safe canvas area (with 24px padding), clamp scale slightly
    max_safe_dim = target_canvas_size - 48
    if total_w * scale > max_safe_dim:
        scale = max_safe_dim / float(total_w)
    if total_h * scale > max_safe_dim:
        scale = max_safe_dim / float(total_h)

    new_w = max(1, int(round(w * scale)))
    new_h = max(1, int(round(h * scale)))

    resized = cleaned_img.resize((new_w, new_h), Image.Resampling.LANCZOS)

    # 4. Canvas assembly with anchored feet baseline and centered body X
    canvas = Image.new("RGBA", (target_canvas_size, target_canvas_size), (0, 0, 0, 0))

    target_feet_y = baseline_y
    target_center_x = target_canvas_size // 2

    dest_top_left_x = int(round(target_center_x - (body_center_x * scale)))
    dest_top_left_y = int(round(target_feet_y - (feet_bottom * scale)))

    canvas.paste(resized, (dest_top_left_x, dest_top_left_y), resized)

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    canvas.save(output_path, "PNG")
    print(
        f"Processed {Path(input_path).name} -> {output_path} | "
        f"Detected Body: {body_height}px -> Scaled: {int(body_height * scale)}px | "
        f"Feet at Y: {int(dest_top_left_y + feet_bottom * scale)}"
    )

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python chroma_processor.py <input> <output> [target_canvas_size] [target_body_height]")
        sys.exit(1)
    canvas_size = int(sys.argv[3]) if len(sys.argv) > 3 else 640
    body_height = int(sys.argv[4]) if len(sys.argv) > 4 else 410
    process_mascot_normalized(sys.argv[1], sys.argv[2], target_canvas_size=canvas_size, target_body_height=body_height)
