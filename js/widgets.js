function Elements()
{
    if(Elements.Instance != undefined) return Elements.Instance; else Elements.Instance = this;

    this.Filter = function(Pattern,Controls,Attr)
    {
        if(Pattern == '') Controls.show();
        else {
            try {
                regexp = new RegExp(Pattern, 'i');
                for(i=0;i<Controls.length; i++) {
                    if(Attr != undefined) {
                        if(!regexp.test($(Controls[i]).attr(Attr)) && !regexp.test(Controls[i].innerHTML)) {
                            $(Controls[i]).hide();
                        }
                        else
                            $(Controls[i]).show();
                    }else{
                        if(!regexp.test(Controls[i].innerHTML)) {
                            $(Controls[i]).hide();
                        }
                        else
                            $(Controls[i]).show();
                    }
                }
            }catch(e) {
                Controls.show();
            }
        }
    }
    
    this.Assert = function(Pattern,Control,Text,Callback)
    {
        var test = Pattern.test($(Control).attr('empty')==1?"":$(Control).val());
        Callback(test==false,Text,Control);
        return test;
    }
    
    return Elements.Instance;
}

function OpenTask(ID)
{
    Dialog().Progress(1,'Открытие...');  
    $.get('/tasks/gettask/'+ID,function(data){ 
        Dialog().Progress(0); 
        $('#NOTIFY_DIALOG').show().html(data).center();
    });
    return false;
}

function Dialog()
{
    if(Dialog.Instance != undefined) return Dialog.Instance; else Dialog.Instance = this;

    this.Modal = function(Url,Width,Height,Callback,ProgressText)
    {
        if(Modal.dialog_container == undefined)
        {
            Modal.dialog_container = document.createElement("DIV");
            Modal.dialog_container.id = "WxDialogContainer";
            Modal.dialog_container.style.display = 'none';
            Modal.dialog_container.style.position = 'absolute';
            document.body.appendChild(Modal.dialog_container);
        }

        if(ProgressText != undefined) {
            Progress(true,ProgressText);
        }

        $.get(Url, function (text)
        {
            Progress(false,'');
            $(Modal.dialog_container).html(text);
            $(Modal.dialog_container).center().show();

            //Modal.dialog_container.style.left = (($(window).width() >> 1) - ((parseInt(Width,10) - 20) >> 1))+'px';
            //this.dialog_container.style.top = document.body.scrollTop + ((document.body.clientHeight >> 1) - (parseInt(Height , 10)>> 1)) - 50;
            //Modal.dialog_container.style.top =  ($(window).scrollTop() + (($(window).height() >> 1) - (parseInt(Height , 10)>> 1)) - 50)+'px';
            //Modal.dialog_container.style.height = Height;
            //Modal.dialog_container.style.width = Width;

            $(Modal.dialog_container).find('form').submit(function() {
                    
                $(Modal.dialog_container).hide();

                if(typeof Callback == 'function') {
                    return Callback(this);
                }
                if(typeof Callback != undefined) {
                    $(this).ajaxSubmit();
                    return false;
                }
            //onsubmit="document.getElementById('$WxDialogContainer').style.display='none'; return false;"
            });
        }
        );
        return false;
    }

    this.Batch = function(arrayUrlsText,callback,reloadAfterComplete,it)
    {
        if(it == undefined) it = 0;
        if(reloadAfterComplete == undefined) reloadAfterComplete = false;

        if(it<arrayUrlsText.length)
        {
            Progress(true,arrayUrlsText[it][1]);

            $.getJSON(arrayUrlsText[it][0],function(json)
            {
                if(callback) { 
                    callback(json);
                }
                Batch(arrayUrlsText,callback,reloadAfterComplete,it+1);
            });
        }
        else
        {
            if(reloadAfterComplete)
                window.location.reload(true);
            else
                Progress(false,'');
        }
    }

    this.Pending = function(url,callback,progressText)
    {
        Progress(true,progressText);
        $.get(url,function(data){
            Progress(false);
            callback(data)
        });
    }

    this.Progress = function(progressShow,progressText)
    {
        if(this.progressInstance == undefined)
        {
            this.progressInstance = document.createElement("DIV");
            this.progressInstance.id = "WxProgressContainer";
            this.progressInstance.style.display = 'none';
            this.progressInstance.style.position = 'fixed';

            var content = document.createElement("DIV");
            content.className = 'content';

            this.progressInstance.appendChild(content);
            document.body.appendChild(this.progressInstance);
        }

        if(progressShow == false)
        {
            this.progressInstance.style.display = 'none';
            return;
        }
        this.progressInstance.firstChild.innerHTML = ((progressText!='' && progressText!=undefined) ?progressText:'<b>Загрузка.....</b>');
        this.progressInstance.style.left = (($(window).width() >> 1) - 80)+'px';
        this.progressInstance.style.top =  0;
            //($(window).scrollTop() + (($(window).height() >> 1) - 30) - 15)+'px';
        this.progressInstance.style.display = '';
    }

    return Dialog.Instance;
}

function Text()
{
    if(Text.Instance != undefined) return Text.Instance; else Text.Instance = this;
    this.getSelectedText = function()
    {
        if(this.getSelected == undefined)
        {
            if(window.getSelection){
                this.getSelected = window.getSelection;
            }else if(document.getSelection){
                this.getSelected = document.getSelection;
            }else if(document.selection){
                this.getSelected = function() {
                    return document.selection.createRange().text
                };
            }
        }
        var st = this.getSelected();
        return (st!='')?st:false;
    }
    this.ClearSelection = function() {
        if(document.clear){
            document.clear();
        }else if(document.selection){
            document.selection.clear();
        }
    }
    return Text.Instance;
}

jQuery.fn.jqcalendar = function() {
    this.css('textAlign','center').datepicker(
    {firstDay:1, dateFormat: 'dd/mm/yy',monthNames:['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],  dayNamesMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'] , monthNamesShort:['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек']});
}

jQuery.fn.center = function () {
    if(this.css('position') !== 'fixed') {
	this.css("position","absolute");
	this.css("top", ( window.innerHeight - $(this).height() ) / 2+$(window).scrollTop() + "px");
	this.css("left", ( window.innerWidth - $(this).width() ) / 2+$(window).scrollLeft() + "px");
    }
    else {
	this.css("top", ( window.innerHeight - $(this).height() ) / 2 + "px");
	this.css("left", ( window.innerWidth - $(this).width() ) / 2+"px");
    }
    
    
    return this;
}

jQuery.fn.reset = function () {
    $(this).each (function() {
        this.reset();
    });
}

jQuery.fn.checkToggle = function () {
    $(this).each (function() {
        this.checked = !this.checked;
    });
}

jQuery.fn.dropdown1 = function (options) {
    //    $(this).data('options',options);
    $(this).attr('tabindex', 0);
    $(this).click(function(){
        $(this).focus();
    });
    $(this).focus(function(){
        //        options = $(this).data('options');
        $(this).width(options.width).height(options.height);
        $(this).children(':last').show();
    }
    );
    $(this).blur(function(){
        $(this).width('auto').height('auto');
        $(this).children(':last').hide()
    });
    $(this).children(':last').hide();
}

jQuery.fn.hideOptionGroup = function() {
    $(this).hide();
    $(this).children().each(function(){
        $(this).attr("disabled", "disabled").removeAttr("selected");
        $(this).hide();
    });
    $(this).appendTo($(this).parent());
}

jQuery.fn.InputOptions = function(Options,nameOption,valueOption,valueDefault,emptyItem) {
    var select = $(this);
    select.empty();
    if(emptyItem != undefined) {
        select.append('<option '+(emptyItem==valueDefault?'selected=""':'')+' value="'+emptyItem+'"></option>');
    }
    for(i=0;i<Options.length;i++) {
        var value = (valueOption != undefined) ? Options[i][valueOption] : i;
        var selected = valueDefault == value ? 'selected' : '';
        var name = (nameOption != undefined) ? Options[i][nameOption] : Options[i];
        select.append('<option '+selected+' value="'+value+'">'+name+'</option>');
    }
}


jQuery.fn.hideOptions = function() {
    $(this).attr("disabled", "disabled").removeAttr("selected");
    $(this).hide();
    $(this).appendTo($(this).parent());
}

jQuery.fn.toggleFN = function(showFN) {
    $(this).toggle();
    if($(this).css('display') != 'none' && typeof(showFN) == 'function' ) {
        showFN();
    }
}

jQuery.fn.showOptions = function() {
    $(this).removeAttr("disabled" );
    $(this).show();
    $(this).prependTo($(this).parent());
    $(this).parent().animate({
        scrollTop:0
    },0);
}

jQuery.fn.showOptionGroup = function() {
    $(this).show();    
    $(this).children().each(function(){
        $(this).removeAttr("disabled" );
        $(this).show();
    });
    $(this).prependTo($(this).parent());
    $(this).parent().animate({
        scrollTop:0
    },0);
};

jQuery.fn.selectGetSelected = function() {
    if($(this).val() !== undefined) {
	return $(this).find('option[value='+$(this).val()+']');
}
    return undefined;
};

jQuery.fn.selectRemoveOptions = function() {
    $(this).find('option,optgroup').remove();
    return $(this);
};

jQuery.fn.selectAddOptions = function(options,selected) {
    var el = this;
    $(options).each(function(){
	$(el).append($("<option></option>").attr("value",this['value']).text(this['name'])); 
    });
    return $(this);
};

jQuery.fn.selectAddOptionsGroup = function(groups,selected) {
    var el = this;
    $.each(groups,function(group,options){
	var gr = $('<optgroup/>');
	$(gr).attr('label',group);
	$(options).each(function(){
	    $(gr).append($("<option></option>").attr("value",this['value']).text(this['name'])); 
	});
	$(el).append(gr);
    });
    return $(this);
};

jQuery.fn.sortElements = (function(){
 
    var sort = [].sort;
 
    return function(comparator, getSortable) {
 
        getSortable = getSortable || function(){
            return this;
        };
 
        var placements = this.map(function(){
 
            var sortElement = getSortable.call(this),
            parentNode = sortElement.parentNode,
 
            // Since the element itself will change position, we have
            // to have some way of storing its original position in
            // the DOM. The easiest way is to have a 'flag' node:
            nextSibling = parentNode.insertBefore(
                document.createTextNode(''),
                sortElement.nextSibling
                );
 
            return function() {
 
                if (parentNode === this) {
                    throw new Error(
                        "You can't sort elements if any one is a descendant of another."
                        );
                }
 
                // Insert before flag:
                parentNode.insertBefore(this, nextSibling);
                // Remove flag:
                parentNode.removeChild(nextSibling);
 
            };
 
        });
 
        return sort.call(this, comparator).each(function(i){
            placements[i].call(getSortable.call(this));
        });
 
    };
 
})();

var wtask = 0;

/*  tasks    */
var wtask_time = 0;

var wtask_minutes = 0;
var wtask_hours = 0;
var wtask_seconds = 0;

function wtask_clock(){
    wtask_time++;
    wtask_seconds++;
    if(wtask_seconds==60){
        wtask_seconds = 0;
        wtask_minutes++;
        if(wtask_minutes==60){
            wtask_minutes = 0;
            wtask_hours++;
        }
    }
    $("#wtask .wtaskBg div:eq(1)").html(wtask_hours+":"+wtask_minutes);
}

function getSelectedUsers(userlist){
    var result=new Array();
    var i = 0;
    userlist.find("input.checkbox:checked").each(function(n,elm){
        result[i] = $(elm).val();
        i++;
    });
    return result;
}

$.widget("ui.monthyear", 
{
        options: { 
        },
        _init: function() {
            var widget = this;
            var Calendar = this.element;
            var Selectors = Calendar.find('select');
            var selDay = Selectors.length==2 ?null:$(Selectors[0]);
            var selMonth = Selectors.length==2 ? $(Selectors[0]):$(Selectors[1]);
            var selYear = Selectors.length==2 ? $(Selectors[1]):$(Selectors[2]);
            Selectors.change(function(){
                var control = $('#'+Calendar.attr('id')+'-value');
                selDay ? control.attr('day',selDay.val()) : 0;
                control.attr('month',selMonth.val());
                control.attr('year',selYear.val());
                widget.draw(0);
            });
            Calendar.find('td.nav>a').click(function(){
                var control = $('#'+Calendar.attr('id')+'-value');
                var day = parseInt(control.attr('day'), 10);
                var month = parseInt(control.attr('month'), 10);
                var year = parseInt(control.attr('year'), 10);
                if($(this).attr('href')=='#left') {
                    if((month - 1) > 0) {
                        month = month - 1;
                    }
                    else {
                        if(selYear.find('option[value="'+(year-1)+'"]').length) {
                            month = 12;
                            year = year-1;
                        }
                    }
                }
                else {
                    if((month + 1) <=12) {
                        month = month + 1;
                    }
                    else {
                        if(selYear.find('option[value="'+(year+1)+'"]').length) {
                            month = 1;
                            year = year+1;
                        }
                    }
                }
                $(selMonth).val(month); control.attr('month',month);
                $(selYear).val(year); control.attr('year',year);
                
                widget.draw(0);
                return false;
            });
            widget.draw(0);
        },
        ymd: function(date,sep)
        {
            var d = date.getDate();
            var m = date.getMonth()+1;
            var y = date.getFullYear();
            sep = sep == undefined ? '':sep;
            return '' + y + sep + (m<=9?'0'+m:m) + sep + (d<=9?'0'+d:d);
        },    
        val: function () {
            return $('#'+this.element.attr('id')+'-value').val();
        },
        draw: function (nav) {
            var Calendar = this.element;
            var control = $('#'+Calendar.attr('id')+'-value');
            var day = parseInt(control.attr('day'), 10);
            var month = parseInt(control.attr('month'), 10);
            var year = parseInt(control.attr('year'), 10);
            this.options.date == undefined && (this.options.date = new Date());
            this.options.date.setFullYear(year, month-1, day);
            
            control.val(this.ymd(this.options.date,'-'));
            
    }
});

$.widget('ui.dropdown',{
    options: {   },
    _init: function() {
        var element = this.element;
        $(element).find('.container').mouseup(function(){ return false; });
        $(element).find('.dropdown').removeAttr('href').mouseup(function(event) {
            $(this).parent('.ui-dropdown').find('.container').toggle();
            $(this).toggleClass('active');
            if($(this).parent('.ui-dropdown').find('.container:visible').length) {
                var doCallback = $(this).attr('ondropdown');
                if(doCallback != undefined) {
                    var callback = new Function(doCallback);
                    callback.call($(this).parent('.ui-dropdown').find('.container')[0]);
                }
            }
        });
        $(window).mouseup(function(event) {
            if((!($(event.target).parent('.ui-dropdown').length > 0) || ($(event.target).parent('.ui-dropdown').attr('id') != $(element).attr('id'))) && !$(event.target).closest('.ui-datepicker').length>0){
                $(element).find('.dropdown').removeClass('active');
                $(element).find('.container').hide();
            }
        });
    },
    settitle: function(title) {
        $(this.element).find('.dropdown').html(title+'<em></em>');
    }
});

$.widget('ui.listbox',{
    options: { onchange: function(){} },
    _init: function() {
	var w = this;
	var element = this.element;
	$(element).find('label>input:radio').change(function(){
	    $(element).find('label').removeClass('a');
	    $(this).closest('label').addClass('a');
	    w.options.onchange($(this).attr('value')!==undefined ? $(this).attr('value') : $(this).parent().text(),this);
	});
    },
    onchange: function(change) {
	this.options.onchange = change;
	var el = $(this.element).find('label.a>input:radio');
	el.length && change($(el).attr('value')!==undefined ? $(el).attr('value') : $(el).parent().text(),el);
    }
});

$(document).ready(function(){
    
    jQuery.expr[":"].icontains = jQuery.expr.createPseudo(function(arg) {
        return function( elem ) {
            return jQuery(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
        };
    });
});
$(function(){
    $(document).on('change','.ui-input-month select',function(){
        var el = $(this).closest('.ui-input-month');
        var vals = el.find('select');
        var day = $(vals[0]).val();
        var month = $(vals[1]).val();
        var year = $(vals[2]).val();
        var val = '';
        if(el.hasClass('month')) {
            if(month !== '' && year !=='') {
                val = '' + year + '-' + month + '-01';
            }
        }
        else {
            if(day !== '' && month !== '' && year !=='') {
                val = '' + year + '-' + month + '-' + day;
            }
        }
        el.find('input[type=hidden]').val(val);
    });
});

$.widget('ui.groupbox', 
{
        options: { 
            accordion: false,
            ontoggle: false,
	    fullheight: false
        },
        _init: function() {
            var groupbox = this;
	    groupbox.options.fullheight = $(this.element).hasClass('fullheight');
            $(this.element).children('li').click(function(){
                if(groupbox.options.accordion) {
                    $(groupbox.element).children('li').removeClass('expand').show();
                }
		if(groupbox.options.fullheight) {
		    var heightLi = 0;
		    $(this).nextAll('li').each(function(){
			heightLi += $(this).first().height();
		    });
		    $(this).prevAll('li').each(function(){
			heightLi += $(this).first().height();
		    });
		    var div = $(this).find('div.fullheight');
		    $(div).css({'overflow-y':'auto',position: 'relative'}).height(
			    $(window).innerHeight() - $(div).position().top -120 - heightLi*2 - 16 - $(this).find(':first').outerHeight(true));
		}
                $(this).toggleClass('expand').show();
                groupbox.options.ontoggle && groupbox.options.ontoggle(this);
            });
            $(this.element).find('li>div').click(function(ev){
                ev.stopPropagation();
            });
	    (groupbox.options.accordion) && $(this.element).find('li:first').click();
        },
        ontoggle : function(callback) {
            this.options.ontoggle = callback;
        }        
});
