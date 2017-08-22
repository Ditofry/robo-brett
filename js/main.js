$(document).ready(function () {
  // Line up our Audio API goodness
  var audioContext = new (window.AudioContext || window.webkitAudioContext)(),
      audioElement = document.getElementById('audioElement'),
      audioSource = audioContext.createMediaElementSource(audioElement),
      analyser = audioContext.createAnalyser();

  // Bind our analyser to the media element source.
  audioSource.connect(analyser);
  audioSource.connect(audioContext.destination);

  var frequencyData = new Uint8Array(20);
  var colorSpectrum = [];

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min));
  }

  // Generate array of random colors
  for (var i = 0; i < 255; i++) {
    colorSpectrum[i] = 'rgb(' + randInt(0, 255) + ',' + randInt(0, 255) + ',' + randInt(0, 255) + ')';
  }

  // Continuously loop and update chart with frequency data.
  // function renderChart() {
  //    requestAnimationFrame(renderChart);

    //  // Copy frequency data to frequencyData array.
    //  analyser.getByteFrequencyData(frequencyData);

     const threeProps = {
         container: document.getElementById("container"),
         material: null,
         camera: new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 5000 ),
         scene: new THREE.Scene(),
         renderer: new THREE.CanvasRenderer(),
         geometry: new THREE.Geometry(),
         cameraY: 480,
         stats: new Stats()
     };

     const particleProps = {
         particles: [],
         colors: [],
         particleRange: { low: 0, hi: 0 },
         particleFieldLength: 0,
         separation: 150,
         groundHeight: 1,
         amountX: 20,
         amountZ: 90,
         yMax: 60
     };

      var controls = new function () {
         this.cameraTilt = 1000;
       };


     init();
     animate();

     function init() {
       var PI2 = Math.PI * 2;

       threeProps.material = new THREE.SpriteCanvasMaterial({
         color: 0xffffff,
         program: function(context) {
           context.beginPath();
           context.arc(0, 0, 0.5, 0, PI2, true);
           context.fill();
         }
       });

       var i = 0;
       for (var iy = 0; iy < particleProps.amountZ; iy++) {
         for (var ix = 0; ix < particleProps.amountX; ix++) {
           let particle = particleProps.particles[i++] = new THREE.Sprite(threeProps.material);

           particle.position.x = ix * particleProps.separation - particleProps.amountX * particleProps.separation / 2;
           particle.position.z = iy * particleProps.separation/4;
           particle.position.y = 0;

           threeProps.scene.add(particle);
         }
       }


       particleProps.particleRange = calcParticleRanges(particleProps.particles);
       particleProps.particleFieldLength = particleProps.particleRange.hi - particleProps.particleRange.low;

       threeProps.camera.position.z = particleProps.particleRange.hi + 1500;
       threeProps.camera.position.y = threeProps.cameraY;
       threeProps.camera.position.x = 0;

       var gui = new dat.GUI();
       gui.add(controls, 'cameraTilt', 100, 2000).listen();

       threeProps.renderer.setPixelRatio(window.devicePixelRatio);
       threeProps.renderer.setSize(window.innerWidth, window.innerHeight);
       threeProps.container.appendChild(threeProps.renderer.domElement);

       threeProps.stats.domElement.style.position = "absolute";
       threeProps.stats.domElement.style.bottom = "0px";
       document.body.appendChild(threeProps.stats.domElement);
       window.addEventListener("resize", onWindowResize, false);
     }

     function onWindowResize() {
       threeProps.camera.aspect = window.innerWidth / window.innerHeight;
       threeProps.camera.updateProjectionMatrix();
       threeProps.renderer.setSize(window.innerWidth, window.innerHeight);
     }

     function animate() {
       requestAnimationFrame(animate);
       // Copy frequency data to frequencyData array.
       analyser.getByteFrequencyData(frequencyData);
       render();
       threeProps.stats.update();
     }

     function render() {
       threeProps.camera.lookAt(new THREE.Vector3(0, -controls.cameraTilt, 0));
       var cameraZ = threeProps.camera.position.z;

       const time = Date.now() * 0.00001;
       const color = 360 * (1.0 + time * 100) % 360 / 360;

       let i = 0;
       let previousRowYVals = [];

       // material.color.setHSL( color, .5, .5 );

       particleProps.particles.forEach((particle, index) => {
         particle.material.color.setHSL( color, 1, 0.5 );
         const previousRowParticle = particleProps.particles[index + particleProps.amountX];
         if(previousRowParticle) {
           // new TWEEN.Tween(particle.position.y).to(previousRowParticle.position.y, 1000).easing(TWEEN.Easing.Quadratic.Out).start();
           // new TWEEN.Tween(particleProps.particles[index].position.y).to(previousRowParticle.position.y, 1000).easing(TWEEN.Easing.Quadratic.Out).start();
           particle.position.y = previousRowParticle.position.y
         }
         particle.scale.x = particle.scale.y = (particle.position.y + 50) / 5;
       });

       waveFrontRow(time);

       particleProps.particles[0].material.color.setHSL(.1, 0.9, 0.5)

       threeProps.renderer.render(threeProps.scene, threeProps.camera);
     }

     function calcParticleRanges (particles) {
         return particles.reduce((range, particle) => {
             return {
                 low: range.low < particle.position.z ? range.low : particle.position.z,
                 hi: range.hi > particle.position.z ? range.hi : particle.position.z
             };
         }, { low: 0, hi: 0 } );
     }

     function randomNumber(min, max) {
       return Math.floor(Math.random() * (max - min + 1)) + min;
     }

     function waveFrontRow(time) {
       for(var i = particleProps.particles.length - particleProps.amountX; i < particleProps.particles.length; i++) {
        //  particleProps.particles[i].position.y = Math.sin(i * 0.4 * time) * particleProps.yMax + 90;
        particleProps.particles[i].position.y = frequencyData[i % 20];
       }
     }




  // }
  // Run the loop
  // renderChart();
});
