﻿/*
 * INVENKTION.DrawCanvasManagr
 * author: Marco Uberti 
 * date:   April, 2013
 * 
 * 		Manager che gestisce il canvas di disegno
 * 
 */
(function($, exports){
	
	var isMobile = true;//touch event or mouse events support
	var paint = false;//only for mouse events
	var paintPointer = false;

	var canvas = null;
	var ctx = null;
	var scaleFactor = null;
	
	var prev_x = -1;
	var prev_y = -1;

	var current_color = "#F00";
	var brush_size = 15;
	var brush_type = 'BRUSH';//BRUSH , ERASER
	
	var gameMode = "GAME";//GAME,ATELIER
	

	function backingScale(context) {
	    if ('devicePixelRatio' in window) {
	        if (window.devicePixelRatio > 1) {
	            return window.devicePixelRatio;
	        }
	    }
	    return 1;
	}

	//Line from the last position to current position
	function drawLine(x, y) {
		ctx.save();
		
		ctx.lineWidth = brush_size;
		ctx.lineCap = 'round';//mub
		if(brush_type == 'BRUSH') {
			ctx.globalCompositeOperation = "source-over";
			ctx.strokeStyle = current_color;
		}else if(brush_type == 'ERASER') {
		    ctx.globalCompositeOperation = "destination-out";
			//ctx.strokeStyle = ("rgba(255,255,255,0)");
		    ctx.strokeStyle = "rgba(0,0,0,1)"
		}
		ctx.beginPath();
		ctx.moveTo(prev_x, prev_y);
		ctx.lineTo(x, y);
		ctx.stroke();
		
		ctx.restore();
	}

	//Check if touch is valid for drawing line and draw the line
	function drawOnTouchMove(x, y) 
	{
		if(!isMobile && !paint) return;//mub per debug con mouse
		
		if (!paintPointer) return;
		console.log("drawtouch");
		if (x || y) 
		{
			if ((prev_x === -1) || prev_y === -1) 
			{
				prev_x = x;
				prev_y = y;
			}
			drawLine(x, y);
			prev_x = x;
			prev_y = y;
		}
		//TODO
		//Ridisegno il tr
	}


	//When canvas is touched, save the coordinates into prev_x and prev_y variables
	function onTouchStart(event)
	{
	    event.preventDefault();
		paintPointer = true;
		x = event.pageX;
		y = event.pageY;
		if (x || y) {
		    prev_x = x;
		    prev_y = y;
		}
	}
	function onMouseStart(event)
	{
		event.preventDefault();
		var touchEvent, x, y;
		touchEvent = event;
		x = touchEvent.pageX - canvas.offsetLeft;
		y = touchEvent.pageY - canvas.offsetTop;
		if (x || y) 
		{
			prev_x = touchEvent.pageX - canvas.offsetLeft;
			prev_y = touchEvent.pageY - canvas.offsetTop;
		}
		paint = true;
	}

	//Draw a line segment when touch move event occurs
	function onTouchMove(event)
	{
	    event.preventDefault();
		var current = event.currentPoint;
		x = event.pageX;
		y = event.pageY;
		drawOnTouchMove(x, y);
	}
	function onMouseMove(event)
	{
		event.preventDefault();
		if(!paint) return;
		var touchEvent, x, y;
		touchEvent = event;
		x = touchEvent.pageX - canvas.offsetLeft;
		y = touchEvent.pageY - canvas.offsetTop;
		drawOnTouchMove(x, y);
	}

	//Capture the touch end event
	function onTouchEnd(event)
	{
	    event.preventDefault();
	    paintPointer = false;
	}
	function onMouseEnd(event)
	{
		event.preventDefault();
		paint = false;
		var touchEvent;
		touchEvent = event;
	}

	//touch cancelled
	function onTouchCancel(event)
	{
		event.preventDefault();
	}
	//touch cancelled
	function onMouseCancel(event)
	{
		event.preventDefault();
		paint = false;
	}

	var level;
	var atelierLevel;
	var section;
	var originalImage;
	var trImage;
	//Il nostro oggetto da esporre
	var mod = {
	     setLevel: function(lev) {
	    	 level = lev;
	     },
	     getLevel: function() {
	    	 return level;
	     },
	     setSection: function(sec) {
	    	 section = sec;
	     },
	     getSection: function() {
	    	 return section;
	     },
		 initCanvas: function(){
			//Prelevo la sezione e livello corrente
			var section;
			var level;
			
			if(this.isGame()) {
				section = this.getSection();
				level = this.getLevel();
				
			}else {
				section = this.getSection();
				level = this.getAtelierLevel();
			}
			INVENKTION.DrawCanvasManager.setSection(section);
			INVENKTION.DrawCanvasManager.setLevel(level);
			
			//Salvo gli oggetti immagine del contorno e immagine completa
			originalImage = new Image();
			originalImage.onload = function() {};
		    originalImage.src = level.immagine;
		    trImage = new Image();
		    trImage.onload = function() {};
		    trImage.src = level.contorno;
		    
			//Setto le immagini di sfondo e i contorni giusti
			$(".imgBG").attr("src",level.immagine);
			$(".imgTR").attr("src",level.contorno);
			$(".canvasImgHelp").attr("src",level.immagine);
			
			//$(".canvas_bgContainer").css("background", "url(" + section.sfondo + ") no-repeat fixed center center / cover");
		    //marco uberti 10/12/2013
			$(".canvas_bgContainer img").attr("src", "" + section.sfondo + "");
			
			//Popolo la tavolozza colori
			var colori =level.colori;
			var numColori = colori.length;
			
			//nascondo tutti i colori prima
			for(var c=1; c<=5; c++) {
				$(".colours"+(c)).hide();
			}
			for(var c=0; c<numColori; c++) {
				var r,g,b;
				r = colori[c][0];
				g = colori[c][1];
				b = colori[c][2];
				//var colorEL = "<a href='#' onclick='javascript:INVENKTION.DrawCanvasManager.setBrushColor("+r+","+g+","+b+")' style='position:fixed; top:"+50*c+"px; left:10px;z-index:10001;'>Color "+(c+1)+"</a>";
				//$("#canvas").append(colorEL);
				
				//Setto il colore alle macchie della tavolozza
				$(".colours"+(c+1)).show();
				$(".colours"+(c+1)).css("background-color","rgb("+r+","+g+","+b+")");
				$('.colorsContainer').removeClass('maxColor'+c);
				
				//imposto il primo colore come colore corrente del pennello
				if(c == 0) {
					this.setBrushColor("rgb("+r+","+g+","+b+")");
				}
			}
			$('.colorsContainer').addClass('maxColor'+numColori);
			$("#canvascontainer").html("");

			
		    //Create a canvas that covers the entire screen
			canvas = document.createElement('canvas');
			document.getElementById('canvascontainer').appendChild(canvas);
			ctx = canvas.getContext("2d");
			scaleFactor = backingScale(ctx);
			/*
			var devicePixelRatio = window.devicePixelRatio || 1;
	        var backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
		        ctx.mozBackingStorePixelRatio ||
		        ctx.msBackingStorePixelRatio ||
		        ctx.oBackingStorePixelRatio ||
		        ctx.backingStorePixelRatio || 1;
	        var ratio = devicePixelRatio / backingStoreRatio;
	        console.log("devicePixelRatio= "+devicePixelRatio);
	        console.log("backingStoreRatio= "+backingStoreRatio);
	        console.log("ratio= "+ratio);
		        
	        canvas.height = window.availableHeight/ratio;
			canvas.width = window.availableWidth/ratio;
			*/
			
			var CW = window.innerWidth;
			var CH = window.innerHeight;
			var listCanvas = document.getElementById("drawListener");


			canvas.width = CW;
			canvas.height = CH;
			$(canvas).css("width", CW+"px");
			$(canvas).css("height", CH + "px");

			listCanvas.width = CW;
			listCanvas.height = CH;
			$(listCanvas).css("width", CW + "px");
			$(listCanvas).css("height", CH + "px");
			ctx = canvas.getContext("2d");

             /*
			if (scaleFactor > 1) {
			    canvas.width = CW * scaleFactor;
			    canvas.height = CH * scaleFactor;
			    $(canvas).css("width", CW + "px");
			    $(canvas).css("height", CH + "px");

			    listCanvas.width = CW * scaleFactor;
			    listCanvas.height = CH * scaleFactor;
			    $(listCanvas).css("width", CW + "px");
			    $(listCanvas).css("height", CH + "px");
			    // update the context for the new canvas scale
			    ctx = canvas.getContext("2d");
			}
            */

			
			if (isMobile) {
			    /*
			    document.addEventListener("touchstart", onTouchStart, false);
			    document.addEventListener("touchmove", onTouchMove, false);
			    document.addEventListener("touchend", onTouchEnd, false);
			    document.addEventListener("touchcancel", onTouchCancel, false);
                */
                /*
			    document.getElementById("drawListener").addEventListener("MSPointerDown", onTouchStart, false);
			    document.getElementById("drawListener").addEventListener("MSPointerMove", onTouchMove, false);
			    document.getElementById("drawListener").addEventListener("MSPointerUp", onTouchEnd, false);
                */
               
			    document.getElementById("drawListener").addEventListener("pointerdown", onTouchStart, false);
			    document.getElementById("drawListener").addEventListener("pointermove", onTouchMove, false);
			    document.getElementById("drawListener").addEventListener("pointerup", onTouchEnd, false);
			    document.getElementById("drawListener").addEventListener("pointerleave", onTouchEnd, false);
			    document.getElementById("drawListener").addEventListener("pointerout", onTouchEnd, false);
                
			}else{
				document.addEventListener("mousedown", onMouseStart, false);
				document.addEventListener("mousemove", onMouseMove, false);
				document.addEventListener("mouseup", onMouseEnd, false);
				document.addEventListener("mouseleave", onMouseCancel, false);
			}
			
			this.initBrushSize();
			
			//A seconda della modalità di gioco faccio azioni diverse
			if(this.getGameMode() == "GAME") {
				//Faccio partire il tempo
				INVENKTION.TimerManager.start();
				//Se è il primo livello della prima sezione oppure il primo dell'atelier
				if (this.getLevel().codice == "w1m1" || this.getLevel().codice == "atm1") {
					INVENKTION.TimerManager.pause();
					//APRO il POPUP DEL TUTORIAL
					INVENKTION.PageShowManager.popUpStart($('#MS_tutorial').html());
					$('.tutorialSlider li').css('width',$('.MS_popUp').css('width'));
				}
				$('.canvas_check').hide();
				$('.canvas_timer').show();
			}else if(this.getGameMode() == "ATELIER") {
				//Nascondo il tempo e mostro il bottone di CHECK
				$('.canvas_check').show();
				$('.canvas_timer').hide();
			}
		 },
		 restartLevel: function(level) {
			 this.clearCanvas();
			 //Ridisegno il background in trasparenza
			 //uso la variabile privata level che contiene il livello
		 },
		 //input: r,g,b
		 setBrushColor : function(r,g,b) {
			 current_color = "rgb("+r+","+g+","+b+")";
			 INVENKTION.DrawCanvasManager.setBrushType('BRUSH');
		 },
		 //input "rgb(r,g,b)"
		 setBrushColor : function(value) {
			 current_color = value;
			 INVENKTION.DrawCanvasManager.setBrushType('BRUSH');
		 },
		 setBrushType: function(type) {
			 brush_type = type;
		 },
		 initBrushSize: function() {
		     brush_size = 50;
		     console.log("images/gommasize" + brush_size / 10 + ".png");
			 $('.sizerBg').attr("src", "images/gommasize" + brush_size / 10 + ".png");
		 },
		 increaseBrushSize: function() {
			 brush_size += 10;
			 if(brush_size > 50) brush_size = 50;//non può andare oltre 50 il pennello
			 $('.sizerBg').attr("src", "images/gommasize" + brush_size/10 + ".png");
		 },
		 decreaseBrushSize: function() {
			 brush_size -= 10;
			 if(brush_size < 10) brush_size = 10;//non può andare sotto 5 il pennello
			 $('.sizerBg').attr("src", "images/gommasize" + brush_size / 10 + ".png");
		 },
		 getBrushColor : function() {
			 return current_color;
		 },
		 getBrushType: function() {
			 return brush_type;
		 },
		 getImageData: function() {
			 //Prendo i dati dell'immagine, ma solo la parte centrale che mi interessa
			 var x = canvas.width/2 - canvas.height/2;
		     var y = 0;
		     var W = canvas.height;
		     var H = canvas.height;
			 var imgd = ctx.getImageData(x, y, W, H);
			 var pix = imgd.data;
			 return pix;
		 },
		 drawImage: function(imageObj) {
			 var x = canvas.width/2 - canvas.height/2;
		     var y = 0;
		     var W = canvas.height;
		     var H = canvas.height;
			 ctx.drawImage(imageObj, x, y, W, H);
		 },
		 clearCanvas: function() {
			 ctx.clearRect(0, 0, canvas.width, canvas.height);
		 },
		 executeTrap: function() {
			 //Eseguo una trappola in una posizione casuale (candeggina)
			 var x = canvas.width/2 - canvas.height/2;
		     var y = 0;
		     var W = canvas.height;
		     var H = canvas.height;
			 var randomX = Math.floor(Math.random()*W);
			 var randomY = Math.floor(Math.random()*H);
			 ctx.save();
			 ctx.globalCompositeOperation = "destination-out";
			 ctx.beginPath();
			 ctx.fillStyle="red";
			 ctx.arc(x+randomX,y+randomY,W/4,0,2*Math.PI);
			 ctx.fill();
			 ctx.restore();
			 INVENKTION.SoundManager.playSound('negative');
		 },
		 executeTrick: function() {
			 //Eseguo un trick (CONTORNI MAGICI)
			 var x = canvas.width/2 - canvas.height/2;
		     var y = 0;
		     var W = canvas.height;
		     var H = canvas.height;
		     //E ne ottengo un cerchio casuale corretto
		     ctx.save();
			 ctx.globalCompositeOperation = "destination-in";
			 ctx.drawImage(originalImage, x, y, W, H);
			 ctx.restore();
			 INVENKTION.SoundManager.playSound('positive');
		 },
		 checkUserDrawing: function() {//se è init vuol dire che sto calcolando la percentuale di base
			 var x = canvas.width/2 - canvas.height/2;
		     var y = 0;
		     var W = canvas.height;
		     var H = canvas.height;
		     
		     //Salvo la versione utente
		     var userRawData = ctx.getImageData(0, 0, canvas.width, H);
			 //var userRawPix = userData.data;
			 //Incollo sul disegno utente il contorno originale
			 ctx.drawImage(trImage, x, y, W, H);
			 //Salvo il disegno utente
			 var userData = ctx.getImageData(x, y, W, H);
			 var userPix = userData.data;
			 //Cancello la lavagna e ci incollo l'immagine completa originale
			 INVENKTION.DrawCanvasManager.clearCanvas();
			 ctx.drawImage(originalImage, x, y, W, H);
			 
			 //Esporto l'immagine originale
			 var originalData = ctx.getImageData(x, y, W, H);
			 var originalPix = originalData.data;
			 var totPixel = originalPix.length/4;
			 //Confronto le due immagini
			 var errori = 0;
			 for (var i = 0, n = originalPix.length; i < n; i += 4) {		
				 if( originalPix[i  ] != userPix[i] || originalPix[i+1 ] != userPix[i+1] || originalPix[i+2 ] != userPix[i+2]) {
					 errori = errori+1;
				 }
			    // i+3 is alpha (the fourth element)
			 }
			 //Cancello e ripristino l'immagine raw dell'utente
			 //INVENKTION.DrawCanvasManager.clearCanvas();
			 //ctx.putImageData(userRawData, 0, 0);
			 //Rilascio le risorse
			 userRawData = null;
			 userData = null;
			 userPix = null;
			 originalData = null;
			 originalPix = null;
			 //Mostro il risultato con un alert
			 var percentageError = (100*errori)/totPixel;
			 var percentage = parseInt(100 - percentageError);
			 //Prima di iniziare il gioco, vedo quale è la percentuale di base del livello corrente
			 //var basePercentage = level.basePercentage;
			 //console.log("PERC="+percentage+"BASE PERCENTAGE = "+basePercentage);
			 //return (100*(percentage-basePercentage))/(100-basePercentage);
			 console.log("percentage = "+percentage);
			 
			 var currLevel = INVENKTION.DrawCanvasManager.getLevel();
			 var currSection = INVENKTION.DrawCanvasManager.getSection();
			 var currentStars = 0;
			 var currentResultTitle = '';
			 if(this.getGameMode()) {
				 INVENKTION.LevelManager.setLevelBestResult(currLevel,percentage);
			 }
			 
			 if(INVENKTION.debug) {
				 percentage  =100;
			 }
			 
			 
			 if(percentage >= 85) {
				 INVENKTION.SoundManager.playSound('positive');
				 if(this.getGameMode()) {
					 INVENKTION.LevelManager.setLevelStars(currSection,currLevel,"3");
					 currentStars = 3;
					 currentResultTitle = 'Excellent!';
					 var resultObj = INVENKTION.LevelManager.unlockNextLevel(currLevel,currSection);
					 if(resultObj.sezione && resultObj.bonus) {
						 $(".imgSectionUnlocked").attr("src",resultObj.sezione.immagine);
						 $(".imgBonusUnlocked").attr("src",resultObj.bonus.immagine);
						 INVENKTION.PageShowManager.popUpStart($('#MS_sectionUnlock').html(),'MS_bonusPaint','MS_resultOk');
					 }else if(resultObj.sezione){
						 $(".imgSectionUnlocked").attr("src",resultObj.sezione.immagine);
						 INVENKTION.PageShowManager.popUpStart($('#MS_sectionUnlock').html(),'MS_resultOk');
					 }else if(resultObj.bonus){
						 $(".imgBonusUnlocked").attr("src",resultObj.bonus.immagine);
						 INVENKTION.PageShowManager.popUpStart($('#MS_bonusPaint').html(),'MS_resultOk');
					 }else {
						 INVENKTION.PageShowManager.popUpStart($('#MS_resultOk').html());
					 }
				 }else{
					 INVENKTION.PageShowManager.popUpStart($('#MS_resultOk').html());
				 }
				 console.log("3 star");
			 }
			 else if(percentage >= 80) {
				 INVENKTION.SoundManager.playSound('positive');
				 if(this.getGameMode()) {
					 INVENKTION.LevelManager.setLevelStars(currSection,currLevel,"2");
					 currentStars = 2;
					 currentResultTitle = 'Good';
					 var resultObj = INVENKTION.LevelManager.unlockNextLevel(currLevel,currSection);
					 if(resultObj.sezione && resultObj.bonus) {
						 $(".imgSectionUnlocked").attr("src",resultObj.sezione.immagine);
						 $(".imgBonusUnlocked").attr("src",resultObj.bonus.immagine);
						 INVENKTION.PageShowManager.popUpStart($('#MS_sectionUnlock').html(),'MS_bonusPaint','MS_resultOk');
					 }else if(resultObj.sezione){
						 $(".imgSectionUnlocked").attr("src",resultObj.sezione.immagine);
						 INVENKTION.PageShowManager.popUpStart($('#MS_sectionUnlock').html(),'MS_resultOk');
					 }else if(resultObj.bonus){
						 $(".imgBonusUnlocked").attr("src",resultObj.bonus.immagine);
						 INVENKTION.PageShowManager.popUpStart($('#MS_bonusPaint').html(),'MS_resultOk');
					 }else {
						 INVENKTION.PageShowManager.popUpStart($('#MS_resultOk').html());
					 }
				 }else{
					 INVENKTION.PageShowManager.popUpStart($('#MS_resultOk').html());
				 }
				 
				 console.log("2 star");
			 }
			 else if(percentage >= 75) {
				 INVENKTION.SoundManager.playSound('positive');
				 if(this.getGameMode()) {
					 INVENKTION.LevelManager.setLevelStars(currSection,currLevel,"1");
					 currentStars = 1;
					 currentResultTitle = 'Not Bad..';
					 var resultObj = INVENKTION.LevelManager.unlockNextLevel(currLevel,currSection);
					 if(resultObj.sezione && resultObj.bonus) {
						 $(".imgSectionUnlocked").attr("src",resultObj.sezione.immagine);
						 $(".imgBonusUnlocked").attr("src",resultObj.bonus.immagine);
						 INVENKTION.PageShowManager.popUpStart($('#MS_sectionUnlock').html(),'MS_bonusPaint','MS_resultOk');
					 }else if(resultObj.sezione){
						 $(".imgSectionUnlocked").attr("src",resultObj.sezione.immagine);
						 INVENKTION.PageShowManager.popUpStart($('#MS_sectionUnlock').html(),'MS_resultOk');
					 }else if(resultObj.bonus){
						 $(".imgBonusUnlocked").attr("src",resultObj.bonus.immagine);
						 INVENKTION.PageShowManager.popUpStart($('#MS_bonusPaint').html(),'MS_resultOk');
					 }else {
						 INVENKTION.PageShowManager.popUpStart($('#MS_resultOk').html());
					 }
				 }else{
					 INVENKTION.PageShowManager.popUpStart($('#MS_resultOk').html());
				 }
				 
				 console.log("1 star");
			 }
			 else {
				 INVENKTION.SoundManager.playSound('negative');
				 if(this.getGameMode()) {
					 INVENKTION.LevelManager.setLevelStars(currSection,currLevel,"0");
				 }
				 INVENKTION.PageShowManager.popUpStart($('#MS_resultBad').html());
				 $("#gameResult").html("bad!!!");
				 console.log("bad result");
			 }
			 $('.resultTitle').html(currentResultTitle);
			 $(".resultsStars").html('<img class="setStars" src="images/setStars'+currentStars+'.png"/>');
			 
			 //Se siamo in atelier, non mostro il bottone NEXT
			 if(!this.isGame()) {
				 $(".gamePause_next").hide();
			 }else {
				 //Se il livello successivo non c'è o è ancora bloccato non mostro il botton NEXT
				 if(INVENKTION.LevelManager.getNextLevel(this.getLevel()) == undefined){
					 $(".gamePause_next").hide();
				 }else {
					 $(".gamePause_next").show();
				 }
			 }
			 
			 return percentage;
		 },
		 setGameMode: function(mode) {
			 gameMode = mode;
		 },
		 getGameMode: function() {
			 return gameMode;
		 },
		 isGame: function() {
			 return this.getGameMode() == "GAME";
		 },
		 setAtelierLevel: function(levObj) {
			 atelierLevel = levObj;
		 },
		 getAtelierLevel: function() {
			 return atelierLevel;
		 },
		 showTrickOrTrap: function(trickOrTrap) {//input "trick" or "trap"
			 var imgPath;
			 if(trickOrTrap == "trick") {
				 imgPath = "images/cutter.png";
			 }else {
				 imgPath = "images/bomb.png";
			 }
			 
			 var aElContainer = $("<a href='#' class='"+trickOrTrap+" trickTrap'></a>");
			 var trickEL = $("<img/>");
				 trickEL.attr("src",imgPath);
				 trickEL.addClass("trickTrapImg");
				 trickEL.addClass("animatedTrickTrap");
				 var top = parseInt(Math.random()*window.innerHeight);
				 var left = parseInt(Math.random()*window.innerWidth);
				 aElContainer.css("top",top+"px");
				 aElContainer.css("left",left+"px");
				 var H = window.innerHeight / 10;
				 trickEL.css("width",H+"px");
				 trickEL.css("height",H+"px");
				 aElContainer.css("width",H+"px");
				 aElContainer.css("height",H+"px");
				 
			 aElContainer.append(trickEL);
			 $("#canvas").append(aElContainer);

             //dopo un secondo rimuovo l'elemento dal DOM
			 window.setTimeout(function () {
			     aElContainer.remove();
			 }, 1000);
		 },
		 showTrick: function() {
			 this.showTrickOrTrap("trick");	 
		 },
		 showTrap: function() {
			 this.showTrickOrTrap("trap");			
		 }
	};

	//Espongo nel global object
	exports.INVENKTION.DrawCanvasManager = mod;
})(jQuery, window);
	
