# simpleDatePicker

![simpledatepicker](https://github.com/user-attachments/assets/37e70483-4d68-4dff-8242-357f38806542)


## Example of use:
  
```
<div id="mySDP"></div>  
<script src="simpledatepicker.js"></script>  
<script>  
const sdp = new simpleDatePicker('mySDP', {  
      allowPrevDate: 'false',  
      inputId: "myInput"  
});  
</script>  
```

## Available options:  
  
**activeDay**: set active day if not current day  
**activeMonth**: set active month if not current month  
**activeYear**: set active year if not current year  
**maxYears**: set +/- available years to show, default 3  
**maxDays**: set number of visible days, recommended odd number, default 5  
**allowPrevDate**: allow selection of a date earlier than the current date, default 'true'  
**datePattern**: default 'YYYY/MM/DD'  
**showArrows**: show arrows, default 'true'  
**arrowHtml**: arrow element, default svg code  
**inputType**: selected date input type, default "hidden"  
**inputId**: selected date input id, default "selectedDate"  
**langLocale**: localization, default "default" in function Intl.DateTimeFormat(locale, { month: "long" })
