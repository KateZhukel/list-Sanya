window.Api = {
    File: {
	Available: function() { return (window.File && window.FileReader && window.FileList && window.Blob); },
	Bind: function(Selector){
	    var object = {
		CallbackOverride: {
		    methodChange: function(){ jsdebug('Api.File.Change'); }
		},
		ElementSubClass: null,
		Files: null,
		Init: function(Selector){
		    $(Selector).change(function(){
			object.ElementSubClass = this;
			object.Files = this.files;
			object.CallbackOverride.methodChange.call(object);
		    });
		    return this;
		},
		Is: function(File,Mime,Size){
		    if(Mime !== undefined && !File.type.match(new RegExp(Mime,'ig'))) return false;
		    if(Size !== undefined && File.size>Size) return false;
		    return true;
		},
		/**
		 * @param FileObject File
		 * @returns FileReader
		 */
		Reader: function() {
		    var reader = new FileReader();
		    reader.Read = function(File,Method) {
			Method === undefined && (Method = 'readAsDataURL');
			this.CompleteOverride !== undefined && (this.onload = this.CompleteOverride);
			this[Method](File);
			return this;
		    }
		    reader.Complete = function(Function){reader.CompleteOverride = Function; return this; }
		    return reader;
		},
		Change: function(Function) {this.CallbackOverride.methodChange = Function; return this;}
	    };
	    return object.Init(Selector);
	}
    }
};
window.std = {
    /**
 * Шаблонизация строки
 * @param {string} tpl шаблон, пременне вставляются в виде "<div class='{$ClassName}'>Шаблон</div>"
 * @returns {Template}
 */
    tpl: function (tpl) {
	var rePattern = /\{\$(\w+)\}/;
	return {
	    exec: function (args) {
		var result = tpl;
		while (match = rePattern.exec(result)) {
		    result = result.replace(match[0], args[match[1]] !== undefined ? (typeof iterator === 'function' ? args[match[1]]() : args[match[1]]) : '');
		}
		return result;
	    }
	}
    },
    Ymd: function(val) {
	match = val.match(/(\d{1,2}).(\d{1,2}).(\d{4})/);
	if (match !== null) {
	    return match[3]+"-"+(("0"+match[2]).substr(-2))+"-"+(("0"+match[1]).substr(-2));
	} else {
	    return null;
	}
    },
    Date: function(val) {
	match = val.match(/(\d{1,2}).(\d{1,2}).(\d{4})/);
	if (match !== null) {
	    return (("0"+match[1]).substr(-2)) + "/" + (("0"+match[2]).substr(-2))+"/"+match[3];
	} else {
	    return null;
	}
    },
    
    on_resize : function(handler) {
	$(window).resize(handler);
	handler();
    },
    cookie : {
	    set: function(name,value,expire_days,path,domain,secure) {
		if(value !== undefined) {
		    path === undefined && (path='/'); 
		    expire_days = (value === null ? -1 : parseInt(expire_days, 10));
		    if(expire_days) {
			var days = expire_days; expire_days = new Date();
			expire_days.setDate(expire_days.getDate() + days);
		    }
		    value = (value !== null ? (typeof value === 'object' ? JSON.stringify(value) : String(value)) : null);

		    return (document.cookie = [
				    encodeURIComponent(name), '=', encodeURIComponent(value),
				    expire_days ? '; expires=' + expire_days.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				    path != undefined ? '; path=' + path : '',
				    domain != undefined ? '; domain=' + domain : '',
				    secure != undefined ? '; secure' : ''
			    ].join(''));
		}
	    },
	    get: function(name,default_value) {
		var cookies = document.cookie.split('; ');
		for (var i = 0, l = cookies.length; i < l; i++) {
			var parts = cookies[i].split('=');
			if (std.cookie.__decode(parts.shift()) === name) {
				var cookie = std.cookie.__decode(parts.join('='));
				return JSON.parse(cookie);
			}
		}
		return default_value;
	    },
	    __decode: function (s) { return decodeURIComponent(s.replace(/\+/g, ' ')); },
	},
    password: function(nMin,nMax,sSpecial,sChars) {
        var chars = '23456789abcdefghijkmnopqrstuvwxyzABCDEFGHIJKLMNPQRSTUVWXYZ';
        var specail = '~!@#$%^&*';
        (nMin == undefined) && (nMin = 8);
        (nMax == undefined) && (nMax = nMin);
        (sChars == undefined) && (sChars = chars);
        sChars += ((sSpecial != undefined)? (sSpecial === true ? specail : sSpecial): '');
        var length = sChars.length;
        var count = Math.floor(((nMin == nMax ? nMax : ((parseInt(Math.random() * Math.random() * 100000) % (nMax-nMin)) + nMin) + 3) / 4)) * 4;
        var password = '';
        for(i=0;i<count;i++) {
            password += sChars[((parseInt(Math.random() * 1000) % length))];
        }
        return password;
    },
    idle: function(seconds,url,callback,type) {
        var timerproc = function(){
            ((url && url!==undefined && url!=='') && $.get(url, callback,type).success(function(data){callback(data)})) || callback(type);
        };
        timerproc();
        setInterval(timerproc,seconds*1000);
        return this;
    },
    storage : {
	available : function() {
	    try {
		return 'localStorage' in window && window['localStorage'] !== null;
	    } catch (e) {
		return false;
	    }
	},
	enum : function (iterator) {
	    if (std.storage.available()) {
		items = [];
		for (var item in localStorage) {
		    if(typeof iterator === 'function' ) {
			iterator(item,std.storage.get(item));
		    }
		    else {
			items[items.length] = item;
		    }

		}
		return items;
	    }
	    return false;
	},
	set : function (name,value) {
	    if(std.storage.available()) {
		value = (value !== null ? (typeof value === 'object' ? JSON.stringify(value) : String(value)) : null);
		value !== null ? localStorage.setItem(encodeURIComponent(name),value) : localStorage.removeItem(encodeURIComponent(name));
	    }
	},
	get : function (name,default_value) {
	    if(std.storage.available()) {
		return localStorage[encodeURIComponent(name)] !== undefined ? localStorage[encodeURIComponent(name)] : default_value;
	    }
	},
        value : function(name,value,default_getvalue) {
	    return value !== undefined ? std.storage.set(name,value) : 
		    std.storage.get(name,default_getvalue);
        },
        clear : function () {
            std.storage.available() && localStorage.clear();
        }
    },
    go : function (uri) {
	window.location = (uri === undefined ? window.location : uri);
    },
    window : {
        center: function(wnd,options) {
            var top = 0;
            var left = 0;
            if (options !== undefined) {
                if (options.left !== undefined)
                    left = options.left;
                if (options.top !== undefined)
                    top = options.top;
            }
            $(wnd).css("position", "fixed");
            $(wnd).css("top", top ? top + "px" : ($(window).height() - $(wnd).height()) / 2 + "px");
            $(wnd).css("left", left ? left + "px" : ($(window).width() - $(wnd).width()) / 2 + "px");
            return $(wnd);
        },
        resize: function(callback) {
            $(window).resize(callback);
            callback();
        },
        caret: function(pos) {
            var target = this[0];
            if (arguments.length === 0) { //get
                if (target.selectionStart) { //DOM
                    var pos = target.selectionStart;
                    return pos > 0 ? pos : 0;
                }
                else if (target.createTextRange) { //IE
                    target.focus();
                    var range = document.selection.createRange();
                    if (range === null)
                        return '0';
                    var re = target.createTextRange();
                    var rc = re.duplicate();
                    re.moveToBookmark(range.getBookmark());
                    rc.setEndPoint('EndToStart', re);
                    return rc.text.length;
                }
                else return 0;
            }

            //set
            var pos_start = pos;
            var pos_end = pos;

            if (arguments.length > 1) {
                pos_end = arguments[1];
            }

            if (target.setSelectionRange) //DOM
                target.setSelectionRange(pos_start, pos_end);
            else if (target.createTextRange) { //IE
                var range = target.createTextRange();
                range.collapse(true);
                range.moveEnd('character', pos_end);
                range.moveStart('character', pos_start);
                range.select();
            }
        }        
    }   	    
}

jsdebug = function (log_txt) {
    if (window.console != undefined) {
        console.log(log_txt);
    }
}

window.WaitEx = {
    __window: false,
    Begin: function(Text,AutocloseTimeout){
        if(!WaitEx.__window) {
            WaitEx.__window = document.createElement("DIV");
            WaitEx.__window.id = "ui-dialog-wait";
            WaitEx.__window.style.display = 'none';
            document.body.appendChild(WaitEx.__window);
        }
            
        $(WaitEx.__window).html(Text).show().css({
            left:(( $(window).width() - $(WaitEx.__window).width() ) / 2+$(window).scrollLeft() + 'px'),
            top: '0px'
        });
	if(AutocloseTimeout !== undefined && AutocloseTimeout>0) {
	    setTimeout(function(){ WaitEx.End(); },AutocloseTimeout);
	}
    },
    End: function(){
        $(WaitEx.__window).hide();
    }
};

window.DialogEx = {
    __window: false,
    __splash: false,
    __id: "ui-dialog-modal",
    
    Close: function() {
        if(DialogEx.__window) {
	    $(DialogEx.__window).children(':first-child').html('');
            $(DialogEx.__window).hide(100);
            $(DialogEx.__window).remove();
        }
        if(DialogEx.__splash && $(DialogEx.__splash).visible()) {
            $(DialogEx.__splash).fadeToggle(100);
        }
        return false;
    },
    /**
         * {url: url, width: , height: height, callback:, div,data}
         */
    Wait : {
        __window: false,
        Begin: function(Text,TimeoutAutoClose){
            if(!DialogEx.Wait.__window) {
                DialogEx.Wait.__window = document.createElement("DIV");
                DialogEx.Wait.__window.id = "ui-dialog-wait";
                DialogEx.Wait.__window.style.display = 'none';
                document.body.appendChild(DialogEx.Wait.__window);
            }

            if(TimeoutAutoClose != undefined) {
                setTimeout(function(){
                    $(DialogEx.Wait.__window).fadeOut(200);
                },TimeoutAutoClose);
            }

            $(DialogEx.Wait.__window).html(Text !== undefined ? Text : 'Переходим' ).show().css({
                left:(( $(window).width() - $(DialogEx.Wait.__window).width() ) / 2+$(window).scrollLeft() + 'px'),
                top: '0px'
            });
        },
        End: function(){
            $(DialogEx.Wait.__window).fadeOut(500);
        }
    },   
    Save : function(Url,Data,SaveText,ErrorText,SuccessText) {
	var context = this;
	context.success = function(callback,result){
	    typeof context.doneCallback === 'function' ? context.doneCallback.call(context,result) :
		    context.doneCallback = callback;
	    return context;
	};
	context.error = function(callback,result){
	    typeof context.failCallback === 'function' ? this.failCallback.call(context,result) :
		    this.failCallback = callback;
	    return context;
	};
	context.doneCallback = undefined;
	context.failCallback = undefined;
	
	DialogEx.Wait.Begin(SaveText !== undefined ? SaveText : 'Сохранение...');
	$.post(Url,Data,null,'json').done(function(result){
	    DialogEx.Wait.Begin(SuccessText !== undefined ? SuccessText : 'Успешно сохранено...',3000);
	    context.success(undefined,result);
	}).fail(function(result){
	    DialogEx.Wait.Begin(ErrorText !== undefined ? ErrorText : 'Ошибка сохранения...',5000);
	    context.error(undefined,result);
	});
	return context;
    },
    Form: function(form,options) {
	    var context = this;
	    context.success = function(callback,result){
		typeof context.doneCallback === 'function' ? context.doneCallback.call(context,result) :
			context.doneCallback = callback;
		return context;
	    };
	    context.error = function(callback,result){
		typeof context.failCallback === 'function' ? this.failCallback.call(context,result) :
			this.failCallback = callback;
		return context;
	    };
	    options === undefined && (options = {dataType: 'json'});
	    context.doneCallback = options.success !== undefined ? options.success : undefined;
	    context.failCallback = options.error !== undefined ? options.error : undefined;
	    
            $(form).ajaxForm({
                    success: function(e){
			DialogEx.Wait.Begin(options.successText !== undefined ? options.successText : 'Данные успешно сохранены',5000);
			context.success(undefined,e);
                    },
                    error: function() {
			DialogEx.Wait.Begin(options.errorText !== undefined ? options.errorText : 'Ошибка сохранения',5000);
			context.error(undefined);
                    },
                    beforeSubmit: function(){ DialogEx.Wait.Begin(options.submitText !== undefined ? options.submitText :'Сохранение данных...'); },
                    dataType: options.dataType
                });
		return context;
        },
    Center: function(){
	(DialogEx.__window !== false) && ($(DialogEx.__window).center());
    },	
    Modal: function(options){
        $(DialogEx.__window).remove();
        DialogEx.__window = false;
        if(DialogEx.__window === false)
        {
            DialogEx.__window = document.createElement("DIV");
            DialogEx.__window.id = DialogEx.__id;
            DialogEx.__window.style.display = 'none';
            DialogEx.__window.appendChild(document.createElement("DIV"));
            document.body.appendChild(DialogEx.__window);
            $(DialogEx.__window).addClass('ui-dialog-modal');
        //$(DialogEx.__window).children(':first-child').addClass('b');
        }
        
        if(options.lock != undefined) {
            if(DialogEx.__splash == false) {
                DialogEx.__splash = document.createElement("DIV");
                DialogEx.__splash.id = 'ui-splashscreen';
                DialogEx.__splash.style.display = 'none';
                document.body.appendChild(DialogEx.__splash);
            }
            pos = $('#'+options.lock).position();
            width = $('#'+options.lock).width();
            height = $('#'+options.lock).height();
        }
            
        if(options.url != undefined) {
            Dialog().Progress(1,'Загрузка...');
            $.get(options.url, options.data, function (text) {
                Dialog().Progress(0);
                $(DialogEx.__window).children(':first-child').html(text);
		$(DialogEx.__window).center(options).show();
		//std.window.center($(DialogEx.__window),options)
		$(DialogEx.__window).find('input:first').focus();
                if($(DialogEx.__window).find('.caption').length) {
                    $(DialogEx.__window).find('.caption').append("<a class='close' onclick='DialogEx.Close(); return false;' ></a>");
                }
                if(typeof options.callback === 'function') {
                    options.callback(text);
                }
		else if(typeof options.success === 'function') {
                    options.success(text);
                }
		$(DialogEx.__window).draggable({
		    disabled: true
		});
		$(DialogEx.__window).find('.draggable').mousedown(function(){
		    $(DialogEx.__window).draggable({
			disabled: false
		    });
		}).mouseup(function(){
		    $(DialogEx.__window).draggable({
			disabled: true
		    });
		});
            });
        }
        else if(options.div !== undefined){
            if(options.lock) {
                $(DialogEx.__splash).css('left',pos.left).css('top',pos.top).width(width).height(height).fadeToggle(100,function(){
                    $(DialogEx.__window).center(options).show();
                    $(DialogEx.__window).find('input:first').focus();
                });
            }
            
            $(DialogEx.__window).children(':first-child').html('').append($('#'+options.div));
	    if($(DialogEx.__window).find('.caption').length) {
		$(DialogEx.__window).find('.caption').append("<a class='close' onclick='DialogEx.Close(); return false;' ></a>");
	    }
            $('#'+options.div).show();
        }

        if(options.width != undefined) $(DialogEx.__window).width(options.width);
        if(options.height != undefined) $(DialogEx.__window).height(options.height);

	$(DialogEx.__window).center(options).show();

        //if(options.lock == undefined)
        //    $(DialogEx.__window).center(options).show();

/*        if(typeof options.callback == 'function') {
            $(DialogEx.__window).find('form').submit(function() {
                return options.callback(this);
            });
        }
*/        return false;
    }
};

$.widget("ui.filterrows", 
{
        options: { 
            items: null,
            hide : null
        },
        $filterrows: null,
        _init: function() {
            $filterrows = this;
        },
        filter: function(attr,value,show) {
            if($filterrows.options.items) {
                $.each($filterrows.options.items,function(){
                    if($(this).attr(attr) == value) {
                        show ? $(this).show() : $(this).hide();
                    }
                });
            }
        }
});

$.widget("ui.filterbox", 
{
        options: { 
            items: null,
            attr: 'filter',
            onsearch: null
        },
        $filterbox: null,
        $resetbutton: null,
        _init: function() {
            $filterbox = this;
            $($filterbox.element).keyup(function(e){
                if (e.keyCode == 27) { 
                    $($filterbox.element).val('');
                    $filterbox.options.onsearch != undefined && $filterbox.options.onsearch($(this).val());
                }
                if (e.keyCode == 13 && $filterbox.options.onsearch != undefined) { $filterbox.options.onsearch($(this).val()); }
                $filterbox.filter($(this).val());
            });
            if($($filterbox.element).parent().find('.reset').length) {
                $resetbutton = $($filterbox.element).parent().find('.reset');
                $($filterbox.element).val()=='' && $resetbutton.css('visibility','hidden');
                $resetbutton.click(function(){
                    $($filterbox.element).val('');
                    $filterbox.filter('');
                    $filterbox.options.onsearch != undefined && $filterbox.options.onsearch($($filterbox.element).val());
                    return false;
                });
            }
        },
        filter: function(text) {
            $resetbutton && $resetbutton.css('visibility',text == '' ? 'hidden' : 'visible');
            if($filterbox.options.items) {
                if(text == '') $($filterbox.options.items).show();
                else {
                    try {
                        var regexp = new RegExp(text, 'i');
                        $($filterbox.options.items).each(function(){
                            if(!regexp.test($(this).attr($filterbox.options.attr))) $(this).hide();
                            else $(this).show();
                        });
                    }catch(e) {
                        $($filterbox.options.items).show();
                    }
                }
            }
        }
});

$.widget("ui.searchbox", 
{
        options: { 
            items: null,
            attr: 'filter',
	    subitems: null,
        },
        _init: function() {
            var searchbox = this;
            $(searchbox.element).keyup(function(e){
		e.preventDefault();
                if (e.keyCode === 27) { 
                    $(searchbox.element).val('');
                }
                searchbox.filter($(this).val());
            });
        },
        filter: function(text) {
	    var searchbox = this;
            if(searchbox.options.items) {
                if(text === '') { $(searchbox.options.items).show(); $(searchbox.options.subitems).show();} 
                else {
                    try {
                        var regexp = new RegExp(text, 'i');
                        $(searchbox.options.items).each(function(){
                            if(!regexp.test($(this).attr(searchbox.options.attr))) $(this).hide();
                            else $(this).show();
                        });
			$(searchbox.options.subitems).each(function(){
                            if(!regexp.test($(this).attr(searchbox.options.attr))) $(this).hide();
                            else $(this).show();
                        });
                    }catch(e) {
                        $(searchbox.options.items).show();
			$(searchbox.options.subitems).show();
                    }
                }
            }
        }
});

$.fn.lazyload = function(Url,Timeout) {
    Timeout = Timeout === undefined ? 100 : Timeout;
    var el = $(this);
    setTimeout(function(){
	$.ajax({
	    url: Url,
	    success: function(Data){
		    el.html(Data);
		},
	    dataType: 'html'
	  });
    },Timeout);
}

$.fn.fileselect = function() {
	    $(this).each(function(){
		if($(this).attr('size') !== undefined) {
		    var size = parseInt($(this).attr('size')) - 1; 
		    if(size) {
			while(size --) {
			    $(this).before($(this).clone()).addClass('empty').attr('disabled',true);
			}
			var inputFields = $('input[type="file"][name="'+$(this).attr('name')+'"]');

			$(inputFields).change(function(){
			    var eFiles = inputFields.filter(function(){ return $(this).val() === '' || $(this).val() === undefined; });
			    eFiles.addClass('empty').attr('disabled',true).filter(':first').removeClass('empty').removeAttr('disabled');
			});
		    }
		}
	    });
	};

$.widget("ui.calendar", 
{
        options: { 
            items: null,
            hide : null
        },
        _init: function() {
            var widget = this;
            var Calendar = this.element;
            Calendar.find('td.day').click(function(){
                var control = $('#'+Calendar.attr('id')+'-value');
                    //Calendar.find('td.day.a').removeClass('a').addClass('n');
                    //$(this).removeClass('day n').addClass("day a");
                control.attr('day',$(this).attr('day'));
                control.attr('month',$(this).attr('month'));
                control.attr('year',$(this).attr('year'));
                control.attr('n-month',$(this).attr('month'));
                control.attr('n-year',$(this).attr('year'));
                Day = new Date(); Day.setFullYear(control.attr('year'),control.attr('month'),control.attr('day'));

                widget.draw(0);
                
                if(widget.options.clickhandler != undefined) {
                    widget.options.clickhandler.call(widget,widget.options.date,
                    [
                        widget.options.date.getDate(),
                        widget.options.date.getMonth()+1,
                        widget.options.date.getFullYear(),
                        widget.options.months[widget.options.date.getMonth()],
                        widget.options.monthss[widget.options.date.getMonth()],
                        widget.options.wdays[widget.options.date.getDay()],
                        widget.options.wdaysf[widget.options.date.getDay()]
                    ]);
                }
            });
            Calendar.find('td.nav>a').click(function(){
                widget.draw(($(this).attr('href')=='#left'?-1:1))
                return false;
            });
            widget.draw(0);
        },
        click: function (handler) {
            this.options.clickhandler = handler;
        },
        val: function () {
            return $('#'+this.element.attr('id')+'-value').val();
        },
        events: function (dayEvents) {
            this.options.events = dayEvents;
            this.draw(0);
        },
        ymd: function(date,sep)
        {
            var d = date.getDate();
            var m = date.getMonth()+1;
            var y = date.getFullYear();
            sep = sep == undefined ? '':sep;
            return '' + y + sep + (m<=9?'0'+m:m) + sep + (d<=9?'0'+d:d);
        },
        draw: function (nav) {
            var Calendar = this.element;
            var control = $('#'+Calendar.attr('id')+'-value');
            var elDays = Calendar.find('td.day');$(elDays).removeClass("a").removeClass("n").removeClass("p");
            var n_month = parseInt(control.attr('n-month'), 10);
            var n_year = parseInt(control.attr('n-year'), 10);
            var month = parseInt(control.attr('month'), 10);
            var year = parseInt(control.attr('year'), 10);
            var day = parseInt(control.attr('day'), 10);
            this.options.date == undefined && (this.options.date = new Date());
            this.options.date.setFullYear(n_year, n_month-1, day);
            
            control.val(this.ymd(this.options.date,'-'));
            
            var firstDay=new Date();firstDay.setFullYear(n_year,n_month-1,1);
            firstDay.setMonth(firstDay.getMonth()+nav);
            control.attr('n-month',firstDay.getMonth()+1).attr('n-year',firstDay.getFullYear());
            n_month = parseInt(control.attr('n-month'), 10);
            n_year = parseInt(control.attr('n-year'), 10);
            var fDayWeek = !firstDay.getDay()?7:firstDay.getDay();
            var tDay = 32 - new Date(firstDay.getFullYear(), firstDay.getMonth(), 32).getDate();
            var outDate = new Date();
            var cl='';
            control.prev().html(this.options.months[firstDay.getMonth()] + ' ' + firstDay.getFullYear());
            for(i=0;i<42;i++) { 
                if((i+1)>=fDayWeek && i<(tDay+fDayWeek-1)) {cl = ((day == (i+1) - (fDayWeek-1)) && n_year==year && n_month == month)?'a':'n';
                    $(elDays[i]).text((i+1) - (fDayWeek-1)).addClass(cl);
                    outDate.setFullYear(firstDay.getFullYear(), firstDay.getMonth(),firstDay.getDate() - (fDayWeek-1) + i);
                }
                else {
                    outDate.setFullYear(firstDay.getFullYear(), firstDay.getMonth(),firstDay.getDate() - (fDayWeek-1) + i);
                    cl = (outDate.getDate() == day && n_year==outDate.getFullYear() && n_month == (outDate.getMonth()+1))?'a':'p';
                    $(elDays[i]).text(outDate.getDate()).addClass(cl);
                }
                $(elDays[i]).attr('month',outDate.getMonth()+1).attr('year',outDate.getFullYear()).attr('day',outDate.getDate());
                if(this.options.events != undefined) {
                    if(this.options.events[this.ymd(outDate)] != undefined) {
                        $(elDays[i]).html('<span class="events">'+this.options.events[this.ymd(outDate)]+'</span>'+$(elDays[i]).text());
                    }
                }
            }
    }
});
