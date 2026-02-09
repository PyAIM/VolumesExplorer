# Volumes Explorer

An interactive 3D educational tool for exploring volumes of solids of revolution using the disk, washer, and shell methods. Built with Three.js for calculus students learning integral applications.

## Features

- **8 Preset Examples** covering all three methods:
  - Disk method (rotation around x-axis)
  - Washer method (region between two curves)
  - Shell method (rotation around y-axis)
  - Parallel axis rotations (y = k, x = k)

- **Interactive 3D Visualization**
  - Orbit controls: drag to rotate, scroll to zoom, right-drag to pan
  - Transparent region highlighting the 2D area being rotated
  - Dimension annotations showing r, h, and Δx on sample rectangles

- **Educational Animations**
  - Animate rectangle rotation to show slice formation
  - Progressive slice animation (Riemann sum buildup)
  - Adjustable number of slices (1-50)

- **Detailed Explanations**
  - Step-by-step integral derivation for each example
  - Emphasis on the Δx → Riemann Sum → Integral transition
  - Approximate vs exact volume comparison

## Live Demo

[View the app on GitHub Pages](https://YOUR_USERNAME.github.io/VolumesExplorer/)

## Usage

### Running Locally

Due to ES6 module restrictions, you need to serve the files via HTTP:

```bash
cd VolumesExplorer
python -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

### Controls

| Control | Action |
|---------|--------|
| **Example dropdown** | Select from 8 preset examples |
| **Show Region** | Highlight the 2D area being rotated |
| **Show Dimensions** | Display labeled sample rectangle (r, h, Δx) |
| **Show Sample Slice** | Display the 3D slice from the sample rectangle |
| **Animate Rotation** | Animate the rectangle rotating to form a slice |
| **Show Slices** | Display all Riemann sum slices |
| **Play Animation** | Animate slices appearing one by one |
| **Show Solid** | Display the complete solid of revolution |
| **Number of Slices** | Adjust Riemann sum approximation (1-50) |

### 3D Navigation

- **Left-drag**: Rotate view
- **Scroll**: Zoom in/out
- **Right-drag**: Pan view

## Examples Included

1. **y = √x** (Disk) - Paraboloid around x-axis
2. **y = sin(x)** (Disk) - Football shape around x-axis
3. **y = x and y = x²** (Washer) - Region between curves
4. **y = 2 and y = x²** (Washer) - Parabola capped by horizontal line
5. **y = x²** (Shell) - Parabola around y-axis
6. **y = √x** (Shell) - Square root curve around y-axis
7. **y = x² around y = -1** (Disk) - Parallel axis rotation
8. **y = √x around x = 1** (Shell) - Parallel axis rotation

## Technology Stack

- [Three.js](https://threejs.org/) - 3D graphics library
- [lil-gui](https://lil-gui.georgealways.com/) - Lightweight GUI controls
- Vanilla JavaScript (ES6 modules)
- CSS3 with dark theme

## Project Structure

```
VolumesExplorer/
├── index.html          # Main HTML file
├── README.md           # This file
├── LICENSE             # MIT License
├── css/
│   └── styles.css      # Dark theme styling
└── js/
    ├── main.js         # App entry point
    ├── scene.js        # Three.js scene setup
    ├── controls.js     # lil-gui control panel
    ├── examples.js     # Preset example definitions
    ├── disk-washer.js  # Disk/washer visualization
    ├── shell.js        # Shell method visualization
    └── utils.js        # Math utilities
```

## Educational Context

This tool is designed to help students understand:

1. **The Setup**: How to identify the radius and height for each method
2. **The Slice**: Volume of a single disk, washer, or shell (ΔV)
3. **The Sum**: Riemann sum approximation (Σ ΔV)
4. **The Limit**: How the sum becomes an integral as Δx → 0
5. **The Integral**: Setting up and evaluating the definite integral

## Browser Support

Tested on modern browsers with WebGL support:
- Chrome (recommended)
- Firefox
- Edge
- Safari

## License

MIT License - See [LICENSE](LICENSE) file for details.

## Author

© 2025 M. Ben-Azzouz

## Acknowledgments

- Three.js community for excellent documentation
- Students whose questions inspired this tool
