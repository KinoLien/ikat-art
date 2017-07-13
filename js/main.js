
var currentWidth;
var currentHeight;
var currentFile;

function onFileChange(e){
	var tgt = e.target || window.event.srcElement,
        files = tgt.files;

    // FileReader support
    if (FileReader && files && files.length) {
        var fr = new FileReader();
        currentFile = files[0];
        fr.onload = function () {
            document.getElementById('originImg').src = fr.result;
        }
        fr.readAsDataURL(currentFile);
    }
    // Not supported
    else {
        // fallback -- perhaps submit the input to an iframe and temporarily store
        // them on the server until the user's session ends.
    }
}

function onUploadClick(){
	var f = document.getElementById('fileinput');
	f && f.click();
}

function onResizeHandler(){
	var imgwrap = document.querySelector('.image-wrap');
	var img = document.getElementById('originImg');
	var canvas = document.getElementById('resultCanvas');
	var ratio = imgwrap.clientWidth / imgwrap.clientHeight;
	var imgRatio = img.naturalWidth / img.naturalHeight;
	if(ratio >= imgRatio){
		canvas.style.cssText = "height: 100%; width: auto;";
		img.setAttribute('width', 'auto');
		img.setAttribute('height', '100%');
	}else{
		canvas.style.cssText = "height: auto; width: 100%;";
		img.setAttribute('width', '100%');
		img.setAttribute('height', 'auto');
	}
}

function onImageLoad(o){
	currentWidth = o.naturalWidth;
	currentHeight = o.naturalHeight;

	var canvas = document.getElementById('resultCanvas');
	canvas.width = o.naturalWidth;
	canvas.height = o.naturalHeight;

	// calculate ratio
	onResizeHandler();
	// onGenerateClick();
}

function onGenerateClick(){
	var img = document.getElementById('originImg');
	var canvas = document.getElementById('resultCanvas');
	var ctx = canvas.getContext('2d');
	ctx.mozImageSmoothingEnabled = ctx.webkitImageSmoothingEnabled = ctx.msImageSmoothingEnabled = ctx.imageSmoothingEnabled = true;
	
	var isH = parseInt(document.getElementById('direction').value) == 1;
	var isPx = parseInt(document.getElementById('unit').value) == 1;
	var w = currentWidth;
	var h = currentHeight;
	var pc = parseInt(document.getElementById('unitNumber').value);
	var step = isPx? pc : Math.floor(isH? (w * pc / 100) : (h * pc / 100));
	var scaleFrom = parseInt(document.getElementById('scaleFrom').value) / 100;
	var scaleTo = parseInt(document.getElementById('scaleTo').value) / 100;
	var scaleFromPc = (scaleFrom > scaleTo)? scaleTo : scaleFrom;
	var scaleToPc = (scaleFrom > scaleTo)? scaleFrom : scaleTo;
	var fixedSide = isH? h : w;
	var scaleSide = isH? w : h;
	var toScale = function(n){
		return n * ( 1 + 
			parseFloat( 
				( Math.random() * (scaleToPc - scaleFromPc) + scaleFromPc ).toFixed(3)
			)
		);
	};

	for(var i = 0; i <= fixedSide; i += step){
		var scaled = toScale(scaleSide);
		var offset = -( Math.random() * ((scaled - scaleSide) / 2) );
		var sxy = isH? [0, i] : [i, 0];
		var swh = isH? [scaleSide, step] : [step, scaleSide];
		var dxy = isH? [offset, i] : [i, offset];
		var dwh = isH? [scaled, step] : [step, scaled];
		// ctx.drawImage(img, i, 0, step, h, i, 0, step, toScale(h));
		ctx.drawImage.apply(ctx, [img].concat(sxy, swh, dxy, dwh));

		// handle the opacity
		var imageData = ctx.getImageData.apply(ctx, sxy.concat(swh));
		var data = imageData.data;
		for(var idx = 3, datalen = data.length; idx < datalen; idx += 4){
			data[idx] *= (scaleSide / scaled) * parseFloat( ( Math.random() * 0.25 + 0.75 ).toFixed(2) );
		}
		// write back
		ctx.putImageData.apply(ctx, [imageData].concat(sxy) );
	}
}

function onGetResultClick(){
	var canvas = document.getElementById('resultCanvas');
	canvas.toBlob(function(blob) {
		saveAs(blob, "(Ikat)" + currentFile.name, currentFile.type);
	});
}

window.addEventListener('resize', onResizeHandler);

// window.addEventListener('load', function(){
// 	['direction', 'unit']
// 		.map(function(id){ return document.getElementById(id); })
// 		.forEach(function(item){
// 			item && item.addEventListener('change', onGenerateClick);
// 		});
// 	['unitNumber', 'scaleFrom', 'scaleTo']
// 		.map(function(id){ return document.getElementById(id); })
// 		.forEach(function(item){
// 			item && item.addEventListener('input', onGenerateClick);
// 		});
// });

