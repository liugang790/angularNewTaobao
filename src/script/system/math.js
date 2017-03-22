(function(angular, undefined){'use strict';

	angular
		.module('system.math',[])
		.provider('systemMath', SystemMathProvider);

	var provider;
	function SystemMathProvider() {
		provider = this;
		this.$get = mathFactory;
	}

	/**
	* 系统计算服务
	* @ngInject
	*/
	function mathFactory($timeout) {
		return {
			//currency
			removePenny 	: removePenny,
			removeDime		: removeDime,
			discount 		: discount,
			cutDown 		: cutDown,
			getDiscountIndex: getDiscountIndex,
			getCutDownIndex : getCutDownIndex,
			pricetFloat		: pricetFloat,

			//time
			convertToTime 	: convertToTime,
			toDateString 	: toDateString,
			calDaysDiff 	: calDaysDiff,
			checkSameDay	: checkSameDay,
			timeLeft 		: timeLeft,
			getDates 		: getDates,

			//number
			getRandomInt 	: getRandomInt
		};
		function removePenny(price) {
			if(angular.isString(price)){
				price = parseFloat(price);
			}
			return parseFloat(price.toFixed(1));
		}
		function removeDime(price) {
			if(angular.isString(price)){
				price = parseFloat(price);
			}
			return parseInt(price);
		}
		function discount(index, price) {
			if(angular.isString(price)){
				price = parseFloat(price);
			}
			price = price * (index/10);
			return parseFloat(price.toFixed(2));
		}
		function cutDown(index, price) {
			if(angular.isString(price)){
				price = parseFloat(price);
			}
			return parseFloat((price-index).toFixed(2));
		}
		function getDiscountIndex(newPrice, original){
			var index = parseFloat((parseFloat(newPrice/original) * 10).toFixed(2)) ;
			return index;
		}
		function getCutDownIndex(newPrice, original) {
			return parseFloat((original-newPrice).toFixed(2));
		}
		function pricetFloat(price){
			var price = parseFloat(price);
			var priceAry= price.toString().split('.');
		 	if(priceAry.length>1){
		 		if(priceAry[1].length<2){
		 			price=price.toString()+"0";
		 		}
			 	return price;
		 	}
		 	if(priceAry.length==1){
				return price.toString()+".00";
			}
		}

		function convertToTime(timeString) {
			if(angular.isString(timeString)){
				timeString = timeString.toString();
			}
			var time = Date.parse(timeString);
			if(isNaN(time)){
				return parseInt(timeString/1000);
			}
			return parseInt(time/1000);
		}

		function calDaysDiff(start, end){
			start = convertToTime(start);
			end = convertToTime(end);
			var diff = Math.floor((end-start) / (60*60*24));
			return diff;
		}

		function checkSameDay(date1, date2){
			if(typeof date1 === 'string'){
				date1 = new Date(date1);
			}
			if(typeof date2 === 'string'){
				date2 = new Date(date2);
			}
			var date1Year = date1.getFullYear();
			var date1Month = date1.getMonth()+1;
			var date1Date = date1.getDate();

			var date2Year = date2.getFullYear();
			var date2Month = date2.getMonth()+1;
			var date2Date = date2.getDate();

			if(date1Year===date2Year && date1Month===date2Month && date1Date===date2Date){
				return true;
			}else{
				return false;
			}
		}

		function timeLeft(endTime) {
			var timeLeftStr = '';
			var timeDiff = (endTime*1000 - (new Date()).getTime())/1000;
			if(timeDiff <= 0){
				return timeLeftStr += ('0时');
			}
			var daysLeft = Math.floor(timeDiff / (60*60*24));
			var hoursLeft = Math.floor((timeDiff - daysLeft*60*60*24)/(60*60));
			var minsLeft = Math.floor((timeDiff - daysLeft*60*60*24 - hoursLeft*60*60)/60);
			var secondsLeft = Math.floor((timeDiff - daysLeft*60*60*24 - hoursLeft*60*60 - minsLeft*60));
			if(daysLeft > 0){
				timeLeftStr += (daysLeft + '天');
			}
			if(hoursLeft > 0){
				timeLeftStr += (hoursLeft + '小时');
			}
			if(minsLeft > 0){
				timeLeftStr += (minsLeft + '分');
			}
			if(minsLeft === 0 && secondsLeft > 0){
				timeLeftStr += (secondsLeft + '秒');
			}
			return timeLeftStr;
		}

		function toDateString(dt, ifHour) {
			var month = (dt.getMonth()+1 <= 9) ? '0'+(dt.getMonth()+1) : (dt.getMonth()+1);
			var date = (dt.getDate() <= 9) ? '0'+dt.getDate() : dt.getDate();
			if(ifHour===false) {
				return  (dt.getFullYear()+'-'+month+'-'+date);
			}
			var hours = (dt.getHours() <= 9) ? '0'+dt.getHours() : dt.getHours();
			var minutes = (dt.getMinutes() <= 9) ? '0'+dt.getMinutes() : dt.getMinutes();
			return (dt.getFullYear()+'-'+month+'-'+date+' '+hours+':'+ minutes);
		}

		Date.prototype.addDays = function(days){
			var dat = new Date(this.valueOf());
			dat.setDate(dat.getDate()+days);
			return dat;
		}

		function getDates(startDate, endDate) {
			var dateArray = new Array();
			var currentDate = startDate;
			while(currentDate <= endDate) {
				dateArray.push(new Date(currentDate));
				var dat = new Date(currentDate);
				dat.setDate(dat.getDate()+1);
				currentDate = dat;
			}
			return dateArray;
		}

		function getRandomInt(min, max) {
		    return Math.floor(Math.random() * (max - min)) + min;
		}
	}
})(window.angular);