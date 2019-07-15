var Finance = {
    Float: function(value,round){
        return value === undefined || value === null || value==='' ? 0.0 : 
                parseFloat(this.Round(parseFloat(typeof value !== 'number' ? value.replace(/[^\d.,]/ig, "").replace(/,/ig,'.') : value),round));
    },
    Round: function(value,round) {
        return round !== undefined && round !== null ? (value !== undefined && value !== null && value!=='' ? value.toFixed(round) : Number(0.0).toFixed(round) ) : value;
    },
    Divide: function(a,b,round) {
        b = this.Float(b);
        a = this.Float(a);
        return this.Round(b !== 0.0 ? (a/b) : 0.0,round);
    },
    GetRound: function (currency) {
        return currency === 'RUB' ? 2 : 2;
    },
    Vat: function(sum,currency) {
        var tax = currency===null ? 0 : (currency === 'RUB' ? 1.18 : 1.2);
        var round = this.GetRound(currency);
        return {vat: this.Round(this.Round(this.Float(sum)*tax,round) - this.Float(sum,round),round),total:this.Round(this.Float(sum)*tax,round),sum:this.Float(sum,round)};
    },
    
    CalcTotal: function(el) {
        var invoice = {sum: 0.0,tax: 0.0, total: 0.0};
        var act = {sum: 0.0,tax: 0.0, total: 0.0};
        $(el).closest('tbody').find('tr.orders-list').each(function(){
            var fields = $(this).find('input[data-calc]');
            var sum = $(fields[3]);
            var tax = $(fields[5]);
            var total = $(fields[6]);
            if($(this).find('input.type.invoice').prop('checked')) {
                invoice.sum += Finance.Float(sum.val(),2);
                invoice.tax += Finance.Float(tax.val(),2);
                invoice.total += Finance.Float(total.val(),2);
            }
            if($(this).find('input.type.act').prop('checked')) {
                act.sum += Finance.Float(sum.val(),2);
                act.tax += Finance.Float(tax.val(),2);
                act.total += Finance.Float(total.val(),2);
            }
        });
        
        var tfoot = $(el).closest('tbody').next('tfoot');
        var invoiceTd = tfoot.find('tr.orders-invoice>td');
        var actTd = tfoot.find('tr.orders-act>td');
        $(invoiceTd[1]).text(Finance.Round(invoice.sum,2));
        $(invoiceTd[3]).text(Finance.Round(invoice.tax,2));
        $(invoiceTd[4]).text(Finance.Round(invoice.total,2));
        
        $(actTd[1]).text(Finance.Round(act.sum,2));
        $(actTd[3]).text(Finance.Round(act.tax,2));
        $(actTd[4]).text(Finance.Round(act.total,2));
    },

    CalcTotalNew: function(el) {
        var invoice = {sum: 0.0,tax: 0.0, total: 0.0};
        var act = {sum: 0.0,tax: 0.0, total: 0.0};
        $(el).closest('tbody').find('tr.orders-list').each(function(){
            var fields = $(this).find('input[data-calc]');
            var sum = $(fields[3]);
            var tax = $(fields[5]);
            var total = $(fields[6]);

            invoice.sum += Finance.Float(sum.val(),2);
            invoice.tax += Finance.Float(tax.val(),2);
            invoice.total += Finance.Float(total.val(),2);

            act.sum += Finance.Float(sum.val(),2);
            act.tax += Finance.Float(tax.val(),2);
            act.total += Finance.Float(total.val(),2);
        });

        var tfoot = $(el).closest('tbody').next('tfoot');
        var invoiceTd = tfoot.find('tr.orders-invoice>td');
        var actTd = tfoot.find('tr.orders-act>td');
        $(invoiceTd[1]).text(Finance.Round(invoice.sum,2));
        $(invoiceTd[3]).text(Finance.Round(invoice.tax,2));
        $(invoiceTd[4]).text(Finance.Round(invoice.total,2));

        $(actTd[1]).text(Finance.Round(act.sum,2));
        $(actTd[3]).text(Finance.Round(act.tax,2));
        $(actTd[4]).text(Finance.Round(act.total,2));
    },

    CalcOrder: function(el) {
        var fields = $(el).closest('tr').find('input[data-calc]');
        var quantity = $(fields[0]);
        var nominal = $(fields[1]);
        var cost = $(fields[2]);
        var sum = $(fields[3]);
        var vat = $(fields[4]);
        var tax = $(fields[5]);
        var total = $(fields[6]);
        
        switch($(el).data('calc')) {
            case 'quantity': case 'cost':
                var sumValue = Finance.Divide(Finance.Float(quantity.val(),4),Finance.Float(nominal.val(),4)) * Finance.Float(cost.val(),4);
                var totalValue = (1.0 + Finance.Float(vat.val(),2)/100.0) * sumValue;
                var taxValue = totalValue - sumValue;
                sum.val(Finance.Round(sumValue,2));
                tax.val(Finance.Round(taxValue,2));
                total.val(Finance.Round(totalValue,2));
                break;
            case 'sum':
                var sumValue = Finance.Float(sum.val(),4);
                var totalValue = (1.0 + Finance.Float(vat.val(),2)/100.0) * sumValue;
                var taxValue = totalValue - sumValue;
                cost.val(Finance.Round(Finance.Divide(sumValue,Finance.Divide(Finance.Float(quantity.val()),Finance.Float(nominal.val()))),2));
                tax.val(Finance.Round(taxValue,2));
                total.val(Finance.Round(totalValue,2));
                break;   
            case 'total':
                var totalValue = Finance.Float(total.val(),4);
                var sumValue = Finance.Divide(totalValue,(1.0 + Finance.Float(vat.val(),2)/100.0));
                var taxValue = totalValue - sumValue;
                cost.val(Finance.Round(Finance.Divide(sumValue,Finance.Divide(Finance.Float(quantity.val()),Finance.Float(nominal.val()))),2));
                tax.val(Finance.Round(taxValue,2));
                sum.val(Finance.Round(sumValue,2));
                break;   
        }
        Finance.CalcTotal(el);
    },
    CalcOrderNew: function(el) {
        var fields = $(el).closest('tr').find('input[data-calc]');
        var quantity = $(fields[0]);
        var nominal = $(fields[1]);
        var cost = $(fields[2]);
        var sum = $(fields[3]);
        var vat = $(fields[4]);
        var tax = $(fields[5]);
        var total = $(fields[6]);

        switch($(el).data('calc')) {
            case 'quantity': case 'cost':
            var sumValue = Finance.Divide(Finance.Float(quantity.val(),4),Finance.Float(nominal.val(),4)) * Finance.Float(cost.val(),4);
            var totalValue = (1.0 + Finance.Float(vat.val(),2)/100.0) * sumValue;
            var taxValue = totalValue - sumValue;
            sum.val(Finance.Round(sumValue,2));
            tax.val(Finance.Round(taxValue,2));
            total.val(Finance.Round(totalValue,2));
            break;
            case 'sum':
                var sumValue = Finance.Float(sum.val(),4);
                var totalValue = (1.0 + Finance.Float(vat.val(),2)/100.0) * sumValue;
                var taxValue = totalValue - sumValue;
                cost.val(Finance.Round(Finance.Divide(sumValue,Finance.Divide(Finance.Float(quantity.val()),Finance.Float(nominal.val()))),2));
                tax.val(Finance.Round(taxValue,2));
                total.val(Finance.Round(totalValue,2));
                break;
            case 'total':
                var totalValue = Finance.Float(total.val(),4);
                var sumValue = Finance.Divide(totalValue,(1.0 + Finance.Float(vat.val(),2)/100.0));
                var taxValue = totalValue - sumValue;
                cost.val(Finance.Round(Finance.Divide(sumValue,Finance.Divide(Finance.Float(quantity.val()),Finance.Float(nominal.val()))),2));
                tax.val(Finance.Round(taxValue,2));
                sum.val(Finance.Round(sumValue,2));
                break;
        }
        Finance.CalcTotalNew(el);
    }
};