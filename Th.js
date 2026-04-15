fetch('points.json')
  .then(res => res.json())
  .then(data => {
    const positions = new Float32Array(data.flat());
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({ size: 0.02 });
    const points = new THREE.Points(geometry, material);

    scene.add(points);
  });