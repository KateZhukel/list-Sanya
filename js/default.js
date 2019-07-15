function checkNotices()
{
    $.getJSON('/index/notices/',function(data){
                                                                        
        if(data) {
            if(data.leave) {
                window.location = '/';
            }
            if(data.mails) {
                var notices = parseInt(data.mails[1], 10);
                $('#mails-counter').text(data.mails[0]);
		if(notices) {
                    if(data.disturb) {
                        Notify.Send('mail','Входящее сообщение','Вам поступило новое сообщение. Всего '+parseInt(data.mails[0], 10)+' непрочитанных сообщений.','https://webcom.netsolution.pro/images/icons/messaging.png');
                    }else{
                        if(!confirm('Новое входящее сообщение. Остаться на месте?')) {
                            window.location = '/mail/0/';
                        }
                    }
                }
            }
            if(data.support) {
                var notices = parseInt(data.support, 10);
                $('#support-counter').text(notices);
                if(parseInt(data.supportAlert,10)) {
                    if(!confirm('Служба поддержки!\nНовое сообщение от клиента. Остаться на месте?')) {
                        window.location = '/support/';
                    }
                }
            }
	    if(data.jokie){
		Notify.Send('1 апреля','Новые уведомления',data.jokie,'https://webcom.netsolution.pro/images/icons/1aprl.jpg');
	    }
	    if(data.sms !== undefined) {
		var Count = parseInt(data.sms.Count, 10);
		$('#sms-counter').removeClass('a');
		Count && $('#sms-counter').addClass('a');
		$('#sms-counter').text(Count);
		if(data.sms.Id !== data.sms.PrevId) {
		    Notify.Send('notice','Входящие SMS','Вам поступила новая SMS. Всего '+Count+' сообщений.','https://webcom.netsolution.pro/images/icons/messaging.png');
		}
	    }
            if(data.notice){
                var notices = parseInt(data.notice, 10);
                if(notices>0)
                    $('#notice-counter').addClass('a');
                $('#notice-counter').text(parseInt(data.notice, 10));
                if(parseInt(data.noticeAlert,10)) {
                    if(data.disturb) {
                        Notify.Send('notice','Новые уведомления','Вам поступило новое уведомление. Всего '+parseInt(data.noticeAlert, 10)+' непрочитанных уведомлений.','https://webcom.netsolution.pro/images/icons/messaging.png');
                    }else {
                        if(!confirm('У вас новое оповещение')) {
                            window.location.reload(true);
                        }
                    }
                }
                if(parseInt(data.noticeNotify,10)) {
                    Notify.Send('notice','Новые уведомления','Вам поступило новое уведомление. Всего '+parseInt(data.noticeNotify, 10)+' непрочитанных уведомлений.','https://webcom.netsolution.pro/images/icons/messaging.png');
                }
                
            }
        }
    })
}

(function(){
    window.Notify = {
	Granted: function() {
	    if(window.Notification) {
		if(Notification.permission) {
		    if(Notification.permission==='default') Notification.requestPermission();
		    return Notification.permission==='granted';
		}
		else {
		     Notification.requestPermission();
		     return true;
		}
	    }
	    return false;
	},
	Send: function(tag,title,text,icon) {
	    if(Notify.Granted()) {
		var msg = new Notification(title, {
			body : (text) ? text : "",
			tag : (tag) ? tag : "",
			icon : (icon) ? icon : ""
		    });
		    msg.onclick = function(){
			match = text.match(/(http:\/\/.*)/m);
			if (match != null) {
			    window.open(match[1]);
			}
		    }
	    }
	}
    };
})();

$(document).ready(function(){
    checkNotices();
    setInterval(checkNotices,30000);
    $('#LOGGING_DIALOG form').submit(function(){
        if($.trim($("#LOGGING_DIALOG form textarea[name='comment']").val()) =='')
            alert('Заполните причину опоздания');
        else
            $.post($('#LOGGING_DIALOG form').attr('action'),$('#LOGGING_DIALOG form').serializeArray(),function(data){
                $("#LOGGING_DIALOG").hide();
            });
                                
        return false;
    });
    
    $(document).on('click','ul.ui-tabs>li>a',function(e){
        e.preventDefault();
        e.stopPropagation();
        $(this).closest('ul').find('li').removeClass('a');
        $(this).closest('li').addClass('a');
        $(this).closest('ul').next('.ui-tabs-container').find('section').removeClass('a').filter('[name="'+$(this).attr('href')+'"]').addClass('a');
    });
    
});
