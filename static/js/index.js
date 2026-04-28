$(document).ready(function() {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");
    });

    var compareWraps = document.querySelectorAll('.compare-wrap');
    compareWraps.forEach(function(compareWrap) {
      var compareHandle = compareWrap.querySelector('.compare-handle');
      var compareSlider = compareWrap.querySelector('.compare-slider');
      if (!compareSlider || !compareHandle) {
        return;
      }

      var updateComparison = function(value) {
        var percent = value + '%';
        compareWrap.style.setProperty('--split', percent);
        compareHandle.style.left = percent;
      };

      updateComparison(compareSlider.value);
      compareSlider.addEventListener('input', function() {
        updateComparison(this.value);
      });
    });

    var rotateCompares = document.querySelectorAll('.rotate-compare');
    rotateCompares.forEach(function(root) {
      var stage = root.querySelector('.rotate-stage');
      var layerA = root.querySelector('.rotate-layer-a');
      var layerB = root.querySelector('.rotate-layer-b');
      var imgA = root.querySelector('.rotate-img-a');
      var imgB = root.querySelector('.rotate-img-b');
      var line = root.querySelector('.rotate-line-segment');
      var lineOuter = root.querySelector('.rotate-line-outer');
      var lineInner = root.querySelector('.rotate-line-inner');
      var guide = root.querySelector('.rotate-guide');
      var badgeLeft = root.querySelector('.rotate-badge-left');
      var badgeRight = root.querySelector('.rotate-badge-right');

      if (!stage || !imgA || !imgB || !layerA || !layerB) {
        return;
      }

      var srcA = root.getAttribute('data-img-a');
      var srcB = root.getAttribute('data-img-b');
      var scaleA = parseFloat(root.getAttribute('data-scale-a') || '1');
      var scaleB = parseFloat(root.getAttribute('data-scale-b') || '0.72');
      var angle = parseFloat(root.getAttribute('data-angle') || '28');
      var labelA = root.getAttribute('data-label-a');
      var labelB = root.getAttribute('data-label-b');
      var tileGridA = null;
      var tileImgsA = [];

      if (layerA) {
        tileGridA = document.createElement('div');
        tileGridA.className = 'rotate-tile-grid';
        for (var i = 0; i < 4; i += 1) {
          var tileImg = document.createElement('img');
          tileImg.className = 'rotate-img-tile';
          tileImg.alt = 'Image A';
          tileGridA.appendChild(tileImg);
          tileImgsA.push(tileImg);
        }
        layerA.appendChild(tileGridA);
      }

      if (labelA && badgeLeft) {
        badgeLeft.textContent = labelA;
      }
      if (labelB && badgeRight) {
        badgeRight.textContent = labelB;
      }

      if (srcA) {
        imgA.src = srcA;
        tileImgsA.forEach(function(tileImg) {
          tileImg.src = srcA;
        });
      }
      if (srcB) {
        imgB.src = srcB;
      }

      imgA.classList.add('rotate-img-helper');
      imgA.style.transform = 'scale(' + scaleA + ')';
      imgB.style.transform = 'scale(' + scaleB + ')';

      var stageSize = { width: 0, height: 0 };
      var imgASize = { width: 0, height: 0 };
      var imgBSize = { width: 0, height: 0 };
      var showGuide = true;

      function setGuideVisible(isVisible) {
        if (!guide) {
          return;
        }
        guide.classList.toggle('is-visible', isVisible);
      }

      function getContainRect(stageWidth, stageHeight, imageWidth, imageHeight, scale) {
        if (!stageWidth || !stageHeight || !imageWidth || !imageHeight) {
          return { left: 0, top: 0, width: stageWidth, height: stageHeight };
        }

        var stageRatio = stageWidth / stageHeight;
        var imageRatio = imageWidth / imageHeight;
        var width = stageWidth;
        var height = stageHeight;

        if (imageRatio > stageRatio) {
          width = stageWidth;
          height = width / imageRatio;
        } else {
          height = stageHeight;
          width = height * imageRatio;
        }

        width *= scale;
        height *= scale;

        return {
          left: (stageWidth - width) / 2,
          top: (stageHeight - height) / 2,
          width: width,
          height: height
        };
      }

      function intersectRect(a, b) {
        var left = Math.max(a.left, b.left);
        var top = Math.max(a.top, b.top);
        var right = Math.min(a.left + a.width, b.left + b.width);
        var bottom = Math.min(a.top + a.height, b.top + b.height);

        if (right <= left || bottom <= top) {
          return null;
        }

        return {
          left: left,
          top: top,
          width: right - left,
          height: bottom - top
        };
      }

      function lineRectIntersections(cx, cy, dx, dy, rect) {
        var pts = [];
        var eps = 1e-6;
        var left = rect.left;
        var right = rect.left + rect.width;
        var top = rect.top;
        var bottom = rect.top + rect.height;

        if (Math.abs(dx) > eps) {
          var t1 = (left - cx) / dx;
          var y1 = cy + t1 * dy;
          if (y1 >= top - eps && y1 <= bottom + eps) pts.push({ x: left, y: y1, t: t1 });

          var t2 = (right - cx) / dx;
          var y2 = cy + t2 * dy;
          if (y2 >= top - eps && y2 <= bottom + eps) pts.push({ x: right, y: y2, t: t2 });
        }

        if (Math.abs(dy) > eps) {
          var t3 = (top - cy) / dy;
          var x3 = cx + t3 * dx;
          if (x3 >= left - eps && x3 <= right + eps) pts.push({ x: x3, y: top, t: t3 });

          var t4 = (bottom - cy) / dy;
          var x4 = cx + t4 * dx;
          if (x4 >= left - eps && x4 <= right + eps) pts.push({ x: x4, y: bottom, t: t4 });
        }

        var unique = [];
        pts.forEach(function(p) {
          var exists = unique.some(function(q) {
            return Math.hypot(q.x - p.x, q.y - p.y) < 0.5;
          });
          if (!exists) {
            unique.push(p);
          }
        });

        if (unique.length < 2) {
          return [
            { x: left, y: cy, t: -1 },
            { x: right, y: cy, t: 1 }
          ];
        }

        unique.sort(function(a, b) { return a.t - b.t; });
        return [unique[0], unique[unique.length - 1]];
      }

      function clipPolygonForSide(angleDeg, side, stageWidth, stageHeight, cx, cy) {
        if (!stageWidth || !stageHeight) {
          return 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';
        }

        var rect = { left: 0, top: 0, width: stageWidth, height: stageHeight };
        var rad = (angleDeg * Math.PI) / 180;
        var dx = Math.cos(rad);
        var dy = Math.sin(rad);
        var nx = -dy;
        var ny = dx;

        var pointsOnLine = lineRectIntersections(cx, cy, dx, dy, rect);
        var p1 = pointsOnLine[0];
        var p2 = pointsOnLine[1];

        var corners = [
          { x: 0, y: 0 },
          { x: stageWidth, y: 0 },
          { x: stageWidth, y: stageHeight },
          { x: 0, y: stageHeight }
        ];

        function keep(point) {
          var value = (point.x - cx) * nx + (point.y - cy) * ny;
          return side === 'positive' ? value >= -1e-6 : value <= 1e-6;
        }

        var points = [p1, p2].concat(corners.filter(keep)).map(function(p) {
          return {
            x: p.x,
            y: p.y,
            angle: Math.atan2(p.y - cy, p.x - cx)
          };
        });

        points.sort(function(a, b) { return a.angle - b.angle; });

        var clip = points.map(function(p) {
          var x = ((p.x / stageWidth) * 100).toFixed(2);
          var y = ((p.y / stageHeight) * 100).toFixed(2);
          return x + '% ' + y + '%';
        }).join(', ');

        return 'polygon(' + clip + ')';
      }

      function updateLayout() {
        if (!stageSize.width || !stageSize.height) {
          return;
        }

        var rectA = getContainRect(stageSize.width, stageSize.height, imgASize.width, imgASize.height, scaleA);
        var rectB = getContainRect(stageSize.width, stageSize.height, imgBSize.width, imgBSize.height, scaleB);
        var imageRect = intersectRect(rectA, rectB) || rectB || rectA;

        if (!imageRect || !imageRect.width || !imageRect.height) {
          return;
        }

        var centerX = imageRect.left + imageRect.width / 2;
        var centerY = imageRect.top + imageRect.height / 2;

        var positiveClip = clipPolygonForSide(angle, 'positive', stageSize.width, stageSize.height, centerX, centerY);
        var negativeClip = clipPolygonForSide(angle, 'negative', stageSize.width, stageSize.height, centerX, centerY);

        layerA.style.clipPath = positiveClip;
        layerB.style.clipPath = negativeClip;

        if (line && lineOuter && lineInner) {
          var rad = (angle * Math.PI) / 180;
          var segment = lineRectIntersections(centerX, centerY, Math.cos(rad), Math.sin(rad), imageRect);
          line.setAttribute('x1', segment[0].x);
          line.setAttribute('y1', segment[0].y);
          line.setAttribute('x2', segment[1].x);
          line.setAttribute('y2', segment[1].y);
          lineOuter.setAttribute('cx', centerX);
          lineOuter.setAttribute('cy', centerY);
          lineInner.setAttribute('cx', centerX);
          lineInner.setAttribute('cy', centerY);
        }

        setGuideVisible(showGuide);
      }

      function updateAngleByPointer(clientX, clientY) {
        if (!stageSize.width || !stageSize.height) {
          return;
        }

        var rectA = getContainRect(stageSize.width, stageSize.height, imgASize.width, imgASize.height, scaleA);
        var rectB = getContainRect(stageSize.width, stageSize.height, imgBSize.width, imgBSize.height, scaleB);
        var imageRect = intersectRect(rectA, rectB) || rectB || rectA;

        if (!imageRect || !imageRect.width || !imageRect.height) {
          return;
        }

        var bounds = stage.getBoundingClientRect();
        var localX = clientX - bounds.left;
        var localY = clientY - bounds.top;
        var centerX = imageRect.left + imageRect.width / 2;
        var centerY = imageRect.top + imageRect.height / 2;
        var dx = localX - centerX;
        var dy = localY - centerY;

        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
          return;
        }

        angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        showGuide = false;
        updateLayout();
      }

      function updateStageSize() {
        var bounds = stage.getBoundingClientRect();
        stageSize = { width: bounds.width, height: bounds.height };
        updateLayout();
      }

      var observer = new ResizeObserver(updateStageSize);
      observer.observe(stage);

      imgA.addEventListener('load', function() {
        imgASize = { width: imgA.naturalWidth, height: imgA.naturalHeight };
        updateLayout();
      });

      imgB.addEventListener('load', function() {
        imgBSize = { width: imgB.naturalWidth, height: imgB.naturalHeight };
        updateLayout();
      });

      stage.addEventListener('pointermove', function(e) {
        updateAngleByPointer(e.clientX, e.clientY);
      });

      stage.addEventListener('pointerdown', function(e) {
        updateAngleByPointer(e.clientX, e.clientY);
      });

      setGuideVisible(true);
      updateStageSize();
    });

    var compareVideos = document.querySelectorAll('.compare-video');
    compareVideos.forEach(function(video) {
      var caption = video.closest('.compare-video-card');
      if (!caption) {
        return;
      }
      var resolutionEl = caption.querySelector('.compare-video-resolution');
      if (!resolutionEl) {
        return;
      }

      function updateResolution() {
        if (video.videoWidth && video.videoHeight) {
          resolutionEl.textContent = 'Resolution: ' + video.videoWidth + 'x' + video.videoHeight;
        }
      }

      video.addEventListener('loadedmetadata', updateResolution);
      updateResolution();
    });
})
