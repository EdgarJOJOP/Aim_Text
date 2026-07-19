/**
 * targets.js — 3D 靶子系统
 * 三种靶子: static(拉枪) / moving(跟枪) / flash(反应)
 */

class AimTarget {
  constructor(type, position, size, lifeTime) {
    this.type = type;
    this.spawnTime = performance.now();
    this.lifeTime = lifeTime || 0;
    this.hit = false;
    this.missed = false;
    this.size = size || 0.3;
    this.hitTime = -1;
    this.moveSpeed = 0;
    this.moveDir = new THREE.Vector3();
    this.bounds = { minX: -4, maxX: 4, minY: -2, maxY: 2 };

    // 主球体
    const geo = new THREE.SphereGeometry(size, 24, 24);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xff4444, emissive: 0xff2222, emissiveIntensity: 0.3,
      metalness: 0.3, roughness: 0.7
    });
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.position.copy(position);
    this.mesh.castShadow = true;

    // 光环
    const rGeo = new THREE.RingGeometry(size * 1.3, size * 1.5, 32);
    const rMat = new THREE.MeshBasicMaterial({
      color: 0x58a6ff, side: THREE.DoubleSide, transparent: true, opacity: 0.4
    });
    this.ring = new THREE.Mesh(rGeo, rMat);
    this.ring.position.copy(position);

    // 移动参数
    if (type === 'moving') {
      this.moveSpeed = 1.5 + Math.random() * 2.0;
      this.moveDir.set(
        Math.random() > 0.5 ? 1 : -1,
        (Math.random() > 0.5 ? 0.5 : -0.5) * 0.5,
        0
      ).normalize();
    }
  }

  update(dt) {
    const age = (performance.now() - this.spawnTime) / 1000;

    if (this.lifeTime > 0 && age > this.lifeTime && !this.hit) {
      this.missed = true;
    }

    if (this.type === 'moving' && !this.hit) {
      const p = this.mesh.position;
      p.x += this.moveDir.x * this.moveSpeed * dt;
      p.y += this.moveDir.y * this.moveSpeed * dt;
      if (p.x > this.bounds.maxX) { p.x = this.bounds.maxX; this.moveDir.x *= -1; }
      if (p.x < this.bounds.minX) { p.x = this.bounds.minX; this.moveDir.x *= -1; }
      if (p.y > this.bounds.maxY) { p.y = this.bounds.maxY; this.moveDir.y *= -1; }
      if (p.y < this.bounds.minY) { p.y = this.bounds.minY; this.moveDir.y *= -1; }
      this.ring.position.copy(p);
    }

    if (this.type === 'flash') {
      const alpha = 0.3 + 0.7 * Math.abs(Math.sin(age * 6));
      this.mesh.material.transparent = true;
      this.mesh.material.opacity = alpha;
    }

    if (this.hit) {
      const s = Math.max(0, 1 - age * 8);
      this.mesh.scale.set(s, s, s);
      this.ring.scale.set(s, s, s);
      if (this.hitTime < 0) this.hitTime = age;
      return s > 0;
    }

    const pulse = 1 + 0.1 * Math.sin(performance.now() * 0.005);
    this.ring.scale.set(pulse, pulse, pulse);
    this.ring.position.copy(this.mesh.position);
    this.ring.lookAt(new THREE.Vector3(0, 0, -5));

    return !this.missed;
  }

  onHit() {
    this.hit = true;
    this.mesh.material.color.setHex(0x3fb950);
    this.mesh.material.emissive.setHex(0x3fb950);
  }

  getPos() { return this.mesh.position; }
  getAge() { return (performance.now() - this.spawnTime) / 1000; }

  removeFrom(scene) {
    scene.remove(this.mesh);
    scene.remove(this.ring);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.ring.geometry.dispose();
    this.ring.material.dispose();
  }
}

window.AimTarget = AimTarget;
