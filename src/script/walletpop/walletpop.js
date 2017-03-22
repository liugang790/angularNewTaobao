//
/* 2016-2-25 version 1 */
/* 弹出红包 */
//
(function($){	
	//默认参数
	var op = {
		title:'',
		subtitle:'',
		btntitle:'',
		autoclose:'false',
		linkurl:'',
		showtype:1,
		logintip:''
	};

 
	
    $.fn.extend({
        //初始化
		walletinit:function(options){
		var walletstyle="";
		if(options.showtype==1)
		{
		//type 1
		walletstyle="";
		walletstyle="<div class='wallet-pop'>";
		walletstyle+="<div class='wallet-close'><a href='javascript:;' id='wallet-close'><img src='https://img.alicdn.com/imgextra/i2/48298907/TB2MlbpjVXXXXXOXFXXXXXXXXXX-48298907.png' /></a></div>";
		walletstyle+="<div class='wallet-info-title'><a href='"+options.linkurl+"' target='_blank'><p>"+options.title+"</p></a><a href='"+options.linkurl+"' target='_blank' class='wallet-middlelink'></a></div>";
		walletstyle+="<div class='wallet-subtitle'><a href='"+options.linkurl+"' target='_blank'><p>"+options.subtitle+"</p></a></div>";
		walletstyle+="<div class='wallet-btn'><a href='"+options.linkurl+"' target='_blank'>"+options.btntitle+"</a></div>";
		walletstyle+="<div class='logintip'>\u8ba2\u8d2d\u540e\u5173\u95ed\u6d4f\u89c8\u5668\u91cd\u65b0\u767b\u5f55\u5373\u53ef</div></div>";
		}
		//type2
		if(options.showtype==2)
		{
			walletstyle="";
			walletstyle="<div class='wallet-pop-2'>";
			walletstyle+="<div class='wallet-close'><a href='javascript:;' id='wallet-close'><img src='https://img.alicdn.com/imgextra/i4/48298907/TB2fYVMkVXXXXawXXXXXXXXXXXX-48298907.png' /></a></div>";
			walletstyle+="<div class='wallet-2-bg'><a href='"+options.linkurl+"' target='_blank'><img src='https://img.alicdn.com/imgextra/i2/48298907/TB2nzxBkVXXXXbVXXXXXXXXXXXX-48298907.png' /></a></div>";
			walletstyle+="<div class='wallet-2-info'><a href='"+options.linkurl+"' target='_blank'><p class='info-title'>"+options.title+"</p><p>"+options.subtitle+"</p></a></div>";
			walletstyle+="<div class='wallet-btn'><a href='"+options.linkurl+"' target='_blank'>"+options.btntitle+"</a></div>";
			walletstyle+="<div class='logintip'>\u8ba2\u8d2d\u540e\u5173\u95ed\u6d4f\u89c8\u5668\u91cd\u65b0\u767b\u5f55\u5373\u53ef</div></div>";
				
		}
		
		//type3
		
		if(options.showtype==3)
		{
			walletstyle="";
			walletstyle="<div class='wallet-pop-3'>";
			walletstyle+="<div class='wallet-close'><a href='javascript:;' id='wallet-close'><img src='https://img.alicdn.com/imgextra/i1/48298907/TB2xvBAkVXXXXciXXXXXXXXXXXX-48298907.png' /></a></div>";
			walletstyle+="<div class='wallet-3-bg'><a href='"+options.linkurl+"' target='_blank'><img src='https://img.alicdn.com/imgextra/i4/48298907/TB2L.JrkVXXXXXqXpXXXXXXXXXX-48298907.png' /></a></div>";
			walletstyle+="<div class='wallet-3-info'><a href='"+options.linkurl+"' target='_blank'><p class='info-title'>"+options.title+"</p><p>"+options.subtitle+"</p></a></div>";
			walletstyle+="<div class='wallet-btn'><a href='"+options.linkurl+"' target='_blank'>"+options.btntitle+"</a></div>";
			walletstyle+="<div class='logintip'>\u8ba2\u8d2d\u540e\u5173\u95ed\u6d4f\u89c8\u5668\u91cd\u65b0\u767b\u5f55\u5373\u53ef</div></div>";
		}
		//type4
		
		if(options.showtype==4)
		{
			walletstyle="";
			walletstyle="<div class='wallet-pop-4'>";
			walletstyle+="<div class='wallet-close'><a href='javascript:;' id='wallet-close'><img src='https://img.alicdn.com/imgextra/i1/48298907/TB2_LQ_eXXXXXbVXXXXXXXXXXXX-48298907.png' /></a></div>";
			walletstyle+="<div class='wallet-4-bg'><a href='"+options.linkurl+"' target='_blank'><img src='https://img.alicdn.com/imgextra/i4/48298907/TB2OGolipXXXXcbXpXXXXXXXXXX-48298907.png' /></a></div>";
			walletstyle+="<div class='wallet-4-title'><a href='"+options.linkurl+"' target='_blank'>"+options.title+"</a></div>";
			walletstyle+="</div>";
		}
		//type5
		
		if(options.showtype==5){
			walletstyle="";
			walletstyle="<div class='wallet-pop-5'>";
			walletstyle+="<div class='wallet-close'><a href='javascript:;' id='wallet-close'><img src='https://img.alicdn.com/imgextra/i1/48298907/TB2xvBAkVXXXXciXXXXXXXXXXXX-48298907.png' /></a></div>";
			walletstyle+="<div class='wallet-5-header'></div>";
			walletstyle+="<div class='wallet-5-bottom'><a class='wallet-5-left' href='http://tb.cn/pR6QVOx' target='_blank'><a class='wallet-5-right' href='http://tb.cn/DM9QVOx' target='_blank'></a></span></div>"
			walletstyle+="</div>"
		}

		var w=$(window).width();
		var h=$(window).height();
		
		var walletbg="<div class='wallet-bg' style=' width:"+w+"px; height:"+h+"px;'></div>";
		
		
		
		$("body").append(walletstyle);
		$("body").append(walletbg);
		$(".wallet-close").click(function(e) {
					$.fn.closecnt();
				});
		
		$(document).resize(function(e) {
            $.fn.resetbg();
        });
		
		
		},
		closecnt:function()
		{
			$(".wallet-pop").fadeOut();
			$(".wallet-bg").fadeOut();
			//
			$(".wallet-pop-2").fadeOut();
			//
			$(".wallet-pop-3").fadeOut();
			$(".wallet-pop-4").fadeOut();
			$(".wallet-pop-5").fadeOut();
		},
		resetbg:function()
		{
			var w=$(window).width();
			var h=$(window).height();
			$(".wallet-bg").width(w);
			$(".wallet-bg").height(h);
		}
		
    });

	
})(jQuery)