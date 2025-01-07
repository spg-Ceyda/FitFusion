$(document).ready(function(){	
var MSIE8 = ($.browser.msie) && ($.browser.version == 8);
	$.fn.ajaxJSSwitch({
		topMargin:250,//mandatory property for decktop
		bottomMargin:180,//mandatory property for decktop
		topMarginMobileDevices:0,//mandatory property for mobile devices
		bottomMarginMobileDevices:0,//mandatory property for mobile devices
		menuInit:function (classMenu, classSubMenu){
			classMenu.find(">li").each(function(){
				var conText = $(this).find('.mText').text();
				$(">a", this).append("<div class='_area'></div><div class='_overPl'></div><div class='_overLine'></div><div class='mTextOver'>"+conText+"</div>"); 
			})
		},
		buttonOver:function (item){
			$(".mText",item).stop(true).animate({top:"160px"}, 600, 'easeOutCubic');
            $(".mTextOver", item).stop(true).delay(150).animate({top:"50px"}, 500, 'easeOutCubic');
			$("._overPl", item).stop(true).animate({bottom:"0px"}, 500, 'easeOutCubic');
			$("._overLine", item).stop(true).animate({opacity:1}, 500, 'easeOutCubic');
		},
		buttonOut:function (item){
			$(".mText", item).stop(true).animate({top:"0px"}, 600, 'easeOutCubic');
			$(".mTextOver", item).stop(true).delay(20).animate({top:"-100px"}, 400, 'easeOutCubic');
			$("._overPl", item).stop(true).animate({bottom:"100px"}, 400, 'easeOutCubic');
			$("._overLine", item).stop(true).animate({opacity:0}, 500, 'easeOutCubic');
		},
		subMenuButtonOver:function (item){
			
		},
		subMenuButtonOut:function (item){
		
		},
		subMenuShow:function(subMenu){
			if(MSIE8){
				//subMenu.css({"display":"block", "margin-top":-(subMenu.outerHeight()+0)});
				subMenu.css({"display":"block", "margin-top":0});
			}else{
				//subMenu.stop(true).css({"display":"block", "margin-top":-(subMenu.outerHeight()+0)}).animate({"opacity":"1"}, 600, "easeInOutCubic");
				subMenu.stop(true).css({"display":"block", "margin-top":0}).animate({"opacity":"1"}, 600, "easeInOutCubic");
			}
		},
		subMenuHide:function(subMenu){
			if(MSIE8){
				subMenu.css({"display":"none"});
			}else{
				subMenu.stop(true).delay(300).animate({"opacity":"0"}, 600, "easeInOutCubic", function(){
					$(this).css({"display":"none"})
				});
			}
		},
		pageInit:function (pages){
		},
		currPageAnimate:function (page){
			page.css({"top":'-1600px'}).stop(true).delay(400).animate({"top":'0px'}, 500, "easeOutCubic");
			//page.css({"top":$(window).height()}).stop(true).delay(400).animate({"top":0}, 1500, "easeOutCubic", function (){$(window).trigger('resize');});
		},
		prevPageAnimate:function (page){
			//page.stop(true).animate({"display":"block", "top":'1600px'}, 700, "easeInCubic");
			page.stop(true).animate({"display":"block", "top":$(window).height()}, 700, "easeInOutCubic");
		},
		backToSplash:function (){
			
		},
		pageLoadComplete:function (){


			if ($(".slogans>ul").length) {
                $('.slogans>ul').cycle({
                    fx: 'scrollVert',
                    speed: 600,
            		timeout: 0,              
            		easing: 'easeInOutCubic',
            		cleartypeNoBg: true ,
                    rev:0,
                    startingSlide: 0,
                    wrap: true
          		})
            };
            
            $("#galleryHolder").gallerySplash({
                autoPlayState:'false',
                paginationDisplay: 'true',
                autoPlayTime: 12,
                alignIMG: 'center'
            });
			
			setTimeout(function() {
				 $('.scroll')
					.uScroll({			
						mousewheel:true,
						step: 136,
						lay:'outside'
					});
					
					$('.scroll_2')
					.uScroll({			
						mousewheel:true,
						step: 197,
						lay:'outside'
					});
					
					$('.scroll_3')
					.uScroll({			
						mousewheel:true,
						step: 197,
						lay:'outside'
					});
					
					 $('.scroll_4')
					.uScroll({			
						mousewheel:true,
						step: 136,
						lay:'outside'
					});

					$('.scroll_5')
					.uScroll({			
						mousewheel:true,
						step: 136,
						lay:'outside'
					});
					
			},300);


		},
	});
	
	////////////////// submenu hover //////////////////// 
		//$('.submenu_1 a b').css({width:'0px'})
		//$('.submenu_2 a span').css({width:'0px'})
		$('.submenu_1 a').hover(function()
			{
				//$(this).find('b').css({width:'0px', left:'-23px'}).stop().animate({width:'234px'}, 300,'easeOutCubic');	
				//$(this).find('span').css({width:'0px', left:'-23px'}).stop().animate({width:'203px'}, 300,'easeOutCubic');			
			}, function(){
				//$(this).find('b').stop().animate({width:'0px', left:'210px'}, 300,'easeOutCubic');
				//$(this).find('span').stop().animate({width:'0px', left:'180px'}, 300,'easeOutCubic');
			})
		////////////////// end submenu hover ////////////////////
	
	
})
$(window).load(function(){	
	$("#webSiteLoader").delay(500).animate({opacity:0}, 600, "easeInCubic", function(){$("#webSiteLoader").remove()});
	
	
	
	//$(".image_resize").image_resize({align_img:"center", mobile_align_img:"center"});
	
	});