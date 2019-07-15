function mailCloseDialog(){
    //  check draft 
    Dialog().Progress(0);  
    DialogEx.Close();
}
var draftIntervalID;       
function mailUpdate(id,status,el)
{
              
    switch(status)
    {
        case 'new':
            Dialog().Progress(true,'Открытие...');
	    DialogEx.Modal({url: '/mail/get/',success:function(){
                draftTimer.restart();
		Dialog().Progress(false,'');
                $('#MAIL-USERS').find('div[group]').hide();
                $('#MAIL-TEXT').keydown(function (e) {
                    if (e.ctrlKey && e.keyCode === 13) {
                        $('#MAIL-SEND').click();
                        draftTimer.stop();
                    }
                    else if(e.keyCode === 27){
                        DialogEx.Close();
                        draftTimer.stop();
                    }
                });
		$('#MAIL-TEXT').focus();
	    }});
            break;
        case 'draft':
            Dialog().Progress(true,'Открытие...');
	    DialogEx.Modal({url: '/mail/getdraft/'+id+'',success:function(){
                draftTimer.restart();
		Dialog().Progress(false,'');
		$('#MAIL-USERS').find('div[group]').hide();
                $('#MAIL_TEXT_REPLY').keydown(function (e) {
                    if (e.ctrlKey && e.keyCode === 13) {
                        $('#MAIL-SEND').click();
                        draftTimer.stop();
                    }
                    else if(e.keyCode === 27){
                        DialogEx.Close(); 
                        draftTimer.stop();
                    }
                });
                $('#MAIL_TEXT_REPLY').focus();
                $('#MAIL_TEXT_REPLY').val($('#MAIL_TEXT_REPLY').val()+"\n");
	    }});
            break        ;
            
        case 'draft-delete':
            Dialog().Progress(true,'Удаление...');
            
	    $.get('/mail/removedraft/'+id+'',function(data){
                $("#draft"+id).next().fadeOut(400);
                $("#draft"+id).fadeOut(700);
                Dialog().Progress(false);
	    });
            break        ;
        case 'read':
            $.getJSON('/mail/?update',{
                msg:id,
                type:status
            },function(data){
                $(el).removeClass('new read').addClass((data && data.status=='0')?'new':'read');
            });
            break;
        case 'notify':
            $.getJSON('/mail/?update',{
                msg:id,
                type:'read'
            },function(data){
                $(el).addClass('notify-g');
            });
            break;    
        case 'reply':
            
            Dialog().Progress(true,'Открытие...');
	    DialogEx.Modal({url: '/mail/get/'+id+'/',success:function(){
                draftTimer.restart();
		Dialog().Progress(false,'');
		$('#MAIL-USERS').find('div[group]').hide();
                $('#MAIL_TEXT_REPLY').keydown(function (e) {
                    if (e.ctrlKey && e.keyCode === 13) {
                        $('#MAIL-SEND').click();
                        draftTimer.stop();
                    }
                    else if(e.keyCode === 27){
                        DialogEx.Close();
                        draftTimer.stop();
                    }
                });
                $('#MAIL_TEXT_REPLY').focus();
                $('#MAIL_TEXT_REPLY').val($('#MAIL_TEXT_REPLY').val()+"\n");
	    }});

            break;  
        case 'replyall':
            var selected_users=new Array();
            var i = 0;
            $(el).next().next().find("input[type='checkbox']:checked").each(function(n,elm){
                selected_users[i] = $(elm).val();
                i++;
            });
            
	    Dialog().Progress(true,'Открытие...');
	    DialogEx.Modal({url: '/mail/get/'+id+'/',data: {replyall:1,users:selected_users},success:function(){
                draftTimer.restart(); 
		Dialog().Progress(false,'');
		$('#MAIL-USERS').find('div[group]').hide();
                $('#MAIL_TEXT_REPLY').keydown(function (e) {
                    if (e.ctrlKey && e.keyCode === 13) {
                        $('#MAIL-SEND').click();
                        draftTimer.stop();
                    }
                    else if(e.keyCode === 27){
                        DialogEx.Close();
                        draftTimer.stop();
                    }
                });
                $('#MAIL_TEXT_REPLY').focus();
                $('#MAIL_TEXT_REPLY').val($('#MAIL_TEXT_REPLY').val()+"\n");
	     }});
            break;  
        case 'forward':
	    Dialog().Progress(true,'Открытие...');
	    DialogEx.Modal({url: '/mail/get/'+id+'/',data: {forward:1},success:function(){
                draftTimer.restart();
		Dialog().Progress(false,'');
		$('#MAIL-USERS').find('div[group]').hide();
                $('#MAIL_TEXT_REPLY').keydown(function (e) {
                    if (e.ctrlKey && e.keyCode === 13) {
                        $('#MAIL-SEND').click();
                        draftTimer.stop();
                    }
                    else if(e.keyCode === 27){
                        DialogEx.Close();
                        draftTimer.stop();
                    }
                });
                $('#MAIL_TEXT_REPLY').focus();
                $('#MAIL_TEXT_REPLY').val($('#MAIL_TEXT_REPLY').val()+"\n");
	     }});
            break;      
        case 'task':
            Dialog().Progress(true,'Постановка задачи...');
            $.get('/mail/?update',{
                msg:id,
                type:status
            },function(data){ 
                Dialog().Progress(0); 
                $('#NOTIFY_DIALOG').show().html(data).center();
                $("#NOTIFY_DIALOG").draggable({
                    containment: "body", 
                    scroll: false, 
                    handle: ".forms .title"
                });
            });
            break;             
        case 'burn':
            $.getJSON('/mail/?update',{
                msg:id,
                type:status
            },function(data){
                $(el).removeClass('burn burng').addClass((data && data.status == 1)?'burn':'burng');
            });
            break;
    }
    return false;
}
            
function onSuccessSend(responseText, statusText, xhr, $form){
    if(statusText=='success'){
        //  set read
        mailUpdate($("#ui-dialog-modal .msgid").val(),0,$("msg"+$("#ui-dialog-modal .msgid").val()).find("td:eq(0) span"));
        $("#msg"+$("#ui-dialog-modal .msgid").val()).next().fadeOut(400);
        $("#msg"+$("#ui-dialog-modal .msgid").val()).fadeOut(700);
	$('#MAIL-TEXT').length && std.storage.set($('#MAIL-TEXT').attr('uniq'),null);
	$('#MAIL_TEXT_REPLY').length && std.storage.set($('#MAIL_TEXT_REPLY').attr('uniq'),null);
        mailCloseDialog();
    }
}
            
function checkSend()
{
    if(!$('#MAIL-USERS').find(':checkbox.user:checked').length) 
    {
        alert('Не выбраны получатели сообщения');
        return false;
    }
    Dialog().Progress(1,'Доставка сообщения...');
    $("#ui-dialog-modal form").ajaxSubmit({
	success: onSuccessSend
    }); 

    return false;
}

function checkGroup(group,checked)
{
    $.each($('#MAIL-USERS').find("div[group='"+group+"'] input:checkbox"),function(){
        this.checked = checked;
    });
}
function checkUser(user,checked)
{
    $.each($('#MAIL-USERS').find("input:checkbox[user='"+user+"']"),function(){
        this.checked = checked;
    });
}
function updateFavorite(id,a)
{
    var leave = parseInt($(a).attr('fav'), 10);
    if(!leave) {
        $.get('/mail/',{
            favorites:'',
            id:id
        }, function(data){
            $('#MAIL-USERS-FAVORITES').html(data);
            $(a).children(':first').css('background-position','-48px -128px');
            $(a).attr('fav',1);
        });
                    
    }
    else {
        $.get('/mail/',{
            favorites:'',
            id:id,
            leave:''
        }, function(data){
            $('#MAIL-USERS-FAVORITES').html(data);
            $(a).children(':first').css('background-position','-16px -128px');
            $(a).attr('fav',0);
        })
    }
    return false;
}
    
    
//  autosave interval

function mail_getusers(){
    var result = new Array();
    var users = $("#MAIL-USERS input:checked");
    if(users.length){
        users.each(function(n,element){
            result.push($(element).val());
        });
    }
    return result;
}


$(document).ready(function(){
    $('.submenu').click(function(e){
	    e.stopPropagation();
	});
	$('.submenu .checkbox>input').click(function(e){
	    e.stopPropagation();
	    DialogEx.Save('/users/ui/main-tabs/',{prop:[$(this).val(),$(this).parent().attr('href'),$(this).prop('checked')]},'Сохраняем изменения...');
	});
	$('.submenu .checkbox').click(function(e){
	    e.stopPropagation();
	    window.location = $(this).attr('href');
	});
	$('.submenu .href').click(function(e){
	    e.preventDefault();
	    e.stopPropagation();
	    if($(this).hasClass('newmail')) { 
		mailUpdate(0,'new');
	    }
	    else if($(this).hasClass('newtask')) { 
		Dialog().Progress(1,'Новая задача...'); 
		DialogEx.Modal({url: $(this).attr('href')});
	    }
	    else if($(this).hasClass('calc')) { 
		DialogEx.Modal({url: $(this).attr('href')});
	    }
	    else {
		window.location = $(this).attr('href');
	    }
	});
		std.window.resize(function() {
		    $('.tab-menu').parent().css({position: 'fixed', width: $(window).width()+16});
		    $('.sizing-box').each(function(){
			$(this).hasClass('fixed') ? 
			    $(this).css({height:$(window).innerHeight()-$(this).position().top - ($(this).outerHeight(true)-$(this).height()+8)}) : 
				    $(this).css({'min-height':$(window).height()-$(this).position().top - ($(this).outerHeight(true)-$(this).height()+8)}); 
			$(this).find('.ui-groupbox.fullheight>li.expand').trigger('click');
		       
		    });
                    $('#IDG-FLOATBAR').length && 
		    $('#IDG-FLOATBAR').css({
			left: $(window).width()-$('#IDG-FLOATBAR').width()-2,
			height: $(window).height()-$('#IDG-FLOATBAR').position().top-4,
			'overflow-y':'auto'});
		    
		});

		$(document).on('click','.dialog',function(e){
		    e.preventDefault();
		    e.stopPropagation();
		    DialogEx.Modal({url: $(this).attr('href')});
		});
		$('.dialog').click(function(e){
		    e.preventDefault();
		    e.stopPropagation();
		    DialogEx.Modal({url: $(this).attr('href')});
		});
		$('.user-popup-info').click(function(e){
		    e.preventDefault();
		    e.stopPropagation();
		    DialogEx.Modal({url: '/users/info/'+$(this).attr('user')+'/'});
		});
		$(document).on('submit','form.ajax-form',function(e){
		    e.preventDefault();
		    var form = $(this);
		    $(this).ajaxSubmit({
			beforeSubmit: function(){
			    WaitEx.Begin(form.attr('wait') !== undefined ? form.attr('wait') : 'Сохраняем изменения...');
			},
			success: function(res){
			    WaitEx.Begin(form.attr('text-success') !== undefined ? form.attr('text-success') : 'Сохранено...',3000);
			    if(form.prop('ajax-form') !== undefined) {
				form.prop('ajax-form').success !== undefined && form.prop('ajax-form').success.apply(form,[res]);
			    }
			},
			error: function(){
			    WaitEx.Begin(form.attr('text-error') !== undefined ? form.attr('text-error') : 'Ошибка сохранения...',3000);
			},
		    });
		});
    
    $(".round > .mail_quote > .mail_quoted").show();
    $(".round > .mail_quote > a").prepend('<a class="mail_expand_all" href="#"><img style="margin-right: 5px;" src="/images/mail/quote_expand.gif" /></a>');
    /*
    
        Mail compose bar
    
     */
    
    //  toggle emotions
    $(document).on('click',".mail_emotions_toggle",function(){
        $(".mail_emotions").toggle();
        return false;
    });
    //  insert emotion
    $(document).on('click',".mail_emotions li",function(){
        //  old method
        mail_getArea().insertAtCaret($(this).attr('smilecode'));
        $(".mail_emotions").toggle();
        return false;
    });
    
    
    //  one level
    $(document).on('click',".mail_quote .expandmsg",function(){
        if($(this).hasClass('mail_expand_all')==false){
            var el = $(this);
            el.next().toggle(); 
        }
        return false;
    });
    //  toggle all
    $(document).on('click',".mail_expand_all",function(){
        if($(this).hasClass("exp")==true){
            $(this).removeClass("exp");
            $(this).next().next().hide();
        } else {
            $(this).addClass("exp");
            $(".mail_quote *").show();
        }
        return false;
    });
    
    
    /*
    
        Helpers
    
     */
    
    
    //  paste into position
    jQuery.fn.extend({
        insertAtCaret: function(myValue){
            return this.each(function(i) {
                if (document.selection) {
                    //For browsers like Internet Explorer
                    this.focus();
                    sel = document.selection.createRange();
                    sel.text = myValue;
                    this.focus();
                }
                else if (this.selectionStart || this.selectionStart == '0') {
                    //For browsers like Firefox and Webkit based
                    var startPos = this.selectionStart;
                    var endPos = this.selectionEnd;
                    var scrollTop = this.scrollTop;
                    this.value = this.value.substring(0, startPos)+myValue+this.value.substring(endPos,this.value.length);
                    this.focus();
                    this.selectionStart = startPos + myValue.length;
                    this.selectionEnd = startPos + myValue.length;
                    this.scrollTop = scrollTop;
                } else {
                    this.value += myValue;
                    this.focus();
                }
            })
        }
    });
  
});

$(document).ready(function(){
    $(document).on('click',"ul.reply-userselect li",function(event){
        var el = $(this);
        if(event.target.localName !='input'){
            el.find('input[type="checkbox"]').prop('checked',!el.find('input[type="checkbox"]').prop("checked"));
        }
        el.parent().prev().prev().find(".reply-count").html(el.parent().find("input[type='checkbox']:checked").length);
    });
    $(document).on('click',"div.mail_innerContainer .mail_innerButton .round-r",function(){
        var el = $(this);
        el.next().width(el.parent().width()).toggle();
        return false; 
    });
});


draftTimer = {
    restart:function(){
        if(draftIntervalID != null) {clearInterval(draftIntervalID);};
        draftIntervalID = setInterval(draftTimer.saveDraft,5000); 
    },
    
    stop:function(){
        clearInterval(draftIntervalID);
        draftIntervalID = null;
    },    
    saveDraft:function(){
        users = [];
        $('input.user[name="msg[to][]"]:checked').each(function(ind,el){
            users[ind] = $(el).val();
        });
        
        msg = tmsg = $('#MAIL_TEXT_REPLY,#MAIL-TEXT').val();
        
        if(msg === undefined){
            draftTimer.stop();
            return;
        }
        
        tmsg = $.trim(tmsg.replace(/\[(quote|forward)[.\s\S]*(quote|forward)\]/gm,''));  

        if(tmsg.length !== 0){
            data = {
                msgdraftid:$('#msgdraftid').val(),
                users:users,
                msg:msg,
                important:$('input[name="msg[important]"]:checked').val(),
                tag:$('input[name="msg[tag]"]:checked').val(),
                project:$('#mail-project option:selected').html(),
                project_id:$('#mail-project').val()            
            }            
            $.post('/mail/draft',data,function(){});
        }else{
             //$.get('/mail/removedraft/'+msgdraftid);     
        }
    }
}