/* SBOM-Demo script.js version 3.8  */
const _version = 3.8

function do_example() {
    $('#main_table .cmp_table').remove()
    add_cmp()
    var inputs = $('#main_table :input').not('select')
    inputs.map(i => inputs[i].value = inputs[i].placeholder)
    var sample_array=[{PackageName:"Windows Embedded Standard 7 with SP1 patches",
		       PackageVersion:"3.0", SupplierName:"Microsoft"},
		      {PackageName:"SQL 2005 Express", PackageVersion:"9.00.5000.00,SP4",
		       SupplierName:"Microsoft"},
		      {ParentComponent:"Component1",PackageName:".Net Frame Work",
		       PackageVersion:"V2.1.21022.8,SP2",SupplierName:"Microsoft"},
		      {PackageName:"Java 8",PackageVersion:"v1.8",SupplierName:"Oracle"},
		      {ParentComponent:"Component5",PackageName:"Tomcat 9",
		       PackageVersion:"v9.037",SupplierName:"Apache Foundation"},
		      {ParentComponent:"Component5",PackageName:"Spring Framework",
		       PackageVersion:"v4.7",SupplierName:"Apache Foundation"}]		      
    for(var i=0; i<sample_array.length; i++) {
	add_cmp()
	var q = sample_array[i]
	var j = String(i+2)
	Object.keys(q).map(function(k,v) {
	    $('#Component'+j+' [name="'+k+'"]').val(q[k])
	})
    }
    var dcmps = $('#main_table [name="PackageName"]')
    for(var i=0; i<dcmps.length; i++) {
	update_cmp_names(dcmps[i])
    }
    generate_spdx()
    setTimeout(function() {
	vul_data.push({vul_part:3,cve:'CVE-2019-2697',cvss_score:8.1})
	add_vul()
	load_vuls()
	simulate_vuls()}, 1000)
    
}
function update_cmp_names(w) {
    var mtable = $(w).closest('table')
    var nval = ' ('+$(w).val()+')'
    var tid = mtable.attr('id')
    mtable.find('.cmp_title').html(tid +nval)
    var otables = $('#main_table .cmp_table').not('#'+tid)
    var tselect = otables.find('.ParentComponent')
    for(var i=0; i< tselect.length; i++) {
	var cval = $(tselect[i]).find('option[value="'+tid+'"]').text()
	if(cval[cval.length-1] == ')')
	    $(tselect[i]).find('option[value="'+tid+'"]').text(cval.replace(/\(.*\)$/,nval))
	else
	    $(tselect[i]).find('option[value="'+tid+'"]').text(cval+nval)
    }
}

function add_cmp() {
    $('#main_table .cmp_table .btn-danger').remove()
    var clen = $('.cmp_table').length
    var dx = $('.cmp_template').html().replace(/d_count/g,clen)
    $('#main_table .tail').before('<tr><td colspan="2">'+dx+'</td></tr>')
    var pcs = $('#main_table .ParentComponent')
    for(var i=0; i<pcs.length; i++) {
	var id = $(pcs[i]).closest('table').attr('id')
	if(id != 'Component'+clen) {
	    $(pcs[i]).append(new Option('Component '+clen,'Component'+clen))
	}
    }
    for(var i=1; i<clen;i++) {
	var xname = $('#Component'+i).find('[name="PackageName"]').val() || ""
	//console.log(xname)
	if(xname != "") {
	    xname = " ("+xname+")"
	}
	var nopt = new Option('Component '+i+xname,'Component'+i)
	$('#Component'+clen+' .ParentComponent').append(nopt)
    }
}
function rm_cmp(w) {
    $(w).closest('table').remove()
}
function add_invalid_feedback(xel,msg) {
    $('.invalid-feedback').remove()
    $('.valid-feedback').remove()    
    if(msg == "")
	msg = 'Please provide valid data for '+$(xel).attr('name')
    var err = $('<div>').html(msg)
    $(xel).after(err)
    $(err).addClass('invalid-feedback').show()
    $(xel).focus()
}
function add_valid_feedback(xel,msg) {
    $('.invalid-feedback').remove()
    $('.valid-feedback').remove()        
    if(msg == "")
	msg = 'Looks good'
    var gdg = $('<div>').html(msg)
    $(xel).after(gdg)
    $(gdg).addClass('valid-feedback').show()
}
function verify_inputs() {
    var inputs=$('#main_table :input').not('button')
    for (var i=0; i< inputs.length; i++) {
	if(!$(inputs[i]).val()) {
	    add_invalid_feedback(inputs[i],"")
	    return false
	}
    }
    return true
}
function generate_spdx() {
    if(verify_inputs() == false)
	return
    var spdx = ""
    var swid = swidHead
    var cyclonedx = cyclonedxHead
    alltreeData = []
    $('#graph svg').remove()
    treeData = []
    fjson = {}
    fjson={"Header":{},"PrimaryComponent":{},"Packages":[]}
    var hinputs = $('#main_table > tbody > tr > td > :input')
    var hkey = {}
    hkey['Created'] = new Date($('[name="Created"]').val()).toISOString()
    hinputs.map(i => hkey[hinputs[i].name] = $('<div>').text(hinputs[i].value).html())
    fjson.Header = hkey
    var thead = $('#spdx .head').html()
    spdx += thead.replace(/\$([A-Za-z0-9]+)/gi, x => hkey[x.replace("$","")])
    hinputs = $('.pcmp_table tr :input')
    var pc = {}
    hinputs.map(i => { hkey[hinputs[i].name] = $('<div>').text(hinputs[i].value).html();
		       pc[hinputs[i].name] = $('<div>').text(hinputs[i].value).html();
		     })
    fjson.PrimaryComponent = pc
    var tpcmp = $('#spdx .pcomponent').html()

    hkey['EscPackageName'] = hkey['PackageName'].replace(/[^A-Z0-9\.\-]/gi,'-')
    hkey['UrlPackageName'] = encodeURIComponent(hkey['PackageName'])
    var PrimaryPackageName = hkey['EscPackageName']
    var swidcmp = $('#swid .cmp').val()
	.replace(/\$([A-Za-z0-9]+)/gi, x => hkey[x.replace("$","")])
    var cyclonedxcmp = $('#cyclonedx .cyclonedxcmp').val()
	.replace(/\$([A-Za-z0-9]+)/gi, x => hkey[x.replace("$","")])
    alltreeData.push({props:JSON.stringify(hkey),
		      name: hkey['PackageName'],
		      parent: null,
		      children:[]})
    swid += swidcmp
    cyclonedx += cyclonedxcmp
    spdx += tpcmp.replace(/\$([A-Za-z0-9]+)/gi, x => hkey[x.replace("$","")])
    //console.log(spdx)
    var cmps = $('#main_table .cmp_table')
    var tpcmps = ""
    var swidpcmps = ""
    var cyclonedxpcmps = ""
    for(var i=0; i< cmps.length; i++) {
	hkey = {}
	hkey['PrimaryPackageName'] = PrimaryPackageName
	var parent = PrimaryPackageName
	hinputs = $(cmps[i]).find(':input').not('button')
	if($(cmps[i]).find(".ParentComponent").val() != "PrimaryComponent") {
	    /* This is a child relationship of level 2 or more */
	    var parentTable = $(cmps[i]).find(".ParentComponent").val()
	    var parentPackageName = $('#'+parentTable).find('input[name="PackageName"]').val()
	    parent = parentPackageName
	    hkey['PrimaryPackageName'] = parentPackageName.replace(/[^A-Z0-9\.\-]/gi,'-')
	    var index = parseInt(parentTable.replace('Component',''))-1
	}
	hinputs.map(i => hkey[hinputs[i].name] = $('<div>').text(hinputs[i].value).html())
	alltreeData.push({props: JSON.stringify(hkey),name: hkey['PackageName'],parent: parent,
			  children:[]})	
	fjson.Packages.push(hkey)
	hkey['EscPackageName'] = hkey['PackageName'].replace(/[^A-Z0-9\.\-]/gi,'-')
	hkey['UrlPackageName'] = encodeURIComponent(hkey['PackageName'])
	tpcmp = $('#spdx .subcomponent').html()
	tpcmps += tpcmp.replace(/\$([A-Za-z0-9]+)/gi, x => hkey[x.replace("$","")])
	swidpcmps += $('#swid .cmp').val().
	    replace(/\$([A-Za-z0-9]+)/gi, x => hkey[x.replace("$","")])
	cyclonedxpcmps += $('#cyclonedx .cyclonedxcmp').val().
	    replace(/\$([A-Za-z0-9]+)/gi, x => hkey[x.replace("$","")])	
    }
    spdx += tpcmps
    swid += swidpcmps+swidTail
    cyclonedx += cyclonedxpcmps + cyclonedxTail
    //alert(spdx)
    $('#swidtext').val(swid)
    $('#cyclonedxtext').val(cyclonedx)
    $('#spdxcontent').html('<pre>'+spdx+'</pre>').show()
    $('#scontent').show()
    var spdxdl = spdx.replace(/\n\s+/g,'\n')
    /* File Prefix */
    var fPfx = $('input[name="DocumentName"]').val().replace(/[^0-9A-Z]/gi,'-')+'-'
    $('#dlspdx').attr('download','SPDX-'+fPfx+timefile()+'.spdx')
    $('#dlspdx').attr('href','data:text/plain;charset=utf-8,' + encodeURIComponent(spdxdl))
    $('#dlswid').attr('download','SWID-'+fPfx+timefile()+'.xml')
    $('#dlswid').attr('href','data:text/plain;charset=utf-8,' + encodeURIComponent(swid))
    $('#dlcyclonedx').attr('download','CycloneDX-'+fPfx+timefile()+'.xml')
    $('#dlcyclonedx').attr('href','data:text/plain;charset=utf-8,'
			   + encodeURIComponent(cyclonedx))        
    treeData=grapharray(alltreeData)
    draw_graph()
}
function generate_uuid() {
    var uuid = Math.random().toString(16).substr(2,8)
    for (var i=0; i<3; i++)
	uuid += '-'+Math.random().toString(16).substr(2,4)
    return uuid+'-'+Math.random().toString(16).substr(2,12)
}
var fjson
var swidHead = '<?xml version="1.0" ?>\n<SwidTags>'
var swidTail = '\n</SwidTags>'
var cyclonedxHead = '<?xml version="1.0"?>\n<bom '+
    'serialNumber="'+generate_uuid()+'"\n'+
    'xmlns="http://cyclonedx.org/schema/bom/1.1">\n'+
    '<components>\n'
var cyclonedxTail = '\n</components>\n</bom>\n'
var diagonal,tree,svg,duration,root
var treeData = []
var vul_data = []
var cve_data = []
document.onkeydown = function(evt) {
    evt = evt || window.event;
    if (evt.keyCode == 27) {
	$('.coverpage').hide()
    }
}
function draw_graph() {
    var margin = {top: 20, right: 120, bottom: 20, left: 120},
	width = 960 - margin.right - margin.left,
	height = 500 - margin.top - margin.bottom;

    duration = 750
    tree = d3.layout.tree()
	.size([height, width]);

    diagonal = d3.svg.diagonal()
	.projection(function(d) { return [d.y, d.x]; });

    svg = d3.select("#graph").append("svg")
	.attr("width", width + margin.right + margin.left)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    root = treeData[0];
    root.x0 = height / 2;
    root.y0 = 0;

    update(root)

    d3.select(self.frameElement).style("height", "500px");
    var svgx = $('svg')[0].outerHTML
    $('#dlsvg').attr('href','data:image/svg+xml;charset=utf-8,'+ encodeURIComponent(svgx))
    $('#dlsvg').attr('download','SVG-'+timefile()+'.svg')
}
function update(source) {
    var i = 0
    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse(),
	links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function(d) { d.y = d.depth * 180;});

    // Update the nodes…
    var node = svg.selectAll("g.node")
	.data(nodes, function(d) { return d.id || (d.id = ++i); });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
	.attr("class", "node")
	.attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
	.on("click", doclick)
	.on("contextmenu",dorightclick)
	.on("mouseover",showdiv)
	.on("mouseout",hidediv)    

    nodeEnter.append("circle")
	.attr("r", 1e-6)
	.style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

    nodeEnter.append("text")
	.attr("x", function(d) { return d.children || d._children ? -13 : 13; })
	.attr("dy", ".35em")
	.attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
	.text(function(d) { return d.name; })
	.style("fill-opacity", 1e-6);

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
	.duration(duration)
	.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

    nodeUpdate.select("circle")
	.attr("r", 10)
	.attr("sid",function(d) { return d.id;})
	.style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

    nodeUpdate.select("text")
	.style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
	.duration(duration)
	.attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
	.remove();

    nodeExit.select("circle")
	.attr("r", 1e-6);

    nodeExit.select("text")
	.style("fill-opacity", 1e-6);

    // Update the links…
    var link = svg.selectAll("path.link")
	.data(links, function(d) { return d.target.id; });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
	.attr("class", "link")
	.attr("d", function(d) {
	    var o = {x: source.x0, y: source.y0};
	    return diagonal({source: o, target: o});
	});

    // Transition links to their new position.
    link.transition()
	.duration(duration)
	.attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
	.duration(duration)
	.attr("d", function(d) {
	    var o = {x: source.x, y: source.y};
	    return diagonal({source: o, target: o});
	})
	.remove();

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
	d.x0 = d.x;
	d.y0 = d.y;
    });
    if(vul_data.length > 0)
	setTimeout(simulate_vuls,1000)
}

function showdiv(d) {
    var iconPos = this.getBoundingClientRect();
    //console.log(JSON.parse(d.props))
    var props = JSON.parse(d.props)
    //console.log(d)
    //console.log(this)
    var bgcolor = 'rgba(70, 130, 180, 0.4)'
    var vul_data = $(this).data()
    if($(this).is('g'))
	vul_data = $(this).find('circle').data()
    //console.log(vul_data)
    var addons = ''
    if('Created' in props)
	addons = '<br>Created on:'+props.Created
    if('Creator' in props)
	addons += '<br>Created by:'+props.Creator
    if('CreatorComment' in props)
	addons += '<br>Comments:'+props.CreatorComment
    if('vul_part' in vul_data) {
	var vid = parseInt(vul_data.vul_part)
	if(d.id != vid) {
	    var findex = alltreeData.findIndex(x => x.id == vid)
	    if(findex > -1)
	    addons += '<br>Vul: <b><i>Inherited from '+alltreeData[findex]['name']+'</i></b>'
	} else {
	    addons += '<br> Vul: <b>'+vul_data.cve+' with CVSS score of '+
		vul_data.cvss_score+'</b>'
	}
	bgcolor = 'rgba('+cvss_tocolor(vul_data.cvss_score)+',0.6)'
    }
    $('#mpopup h5').html(props.PackageName)
    $('#mpopup p').html('Version: '+props.PackageVersion
			+'<br>Supplier:'+props.SupplierName+addons)
    $('#mpopup').css({left:(iconPos.right + 20) + "px",
		      top:(window.scrollY + iconPos.top - 60) + "px",
		      background: bgcolor,
		      display:"block"})
    
    //$(this).append("<div class='boom'>Hello</div>")
    //console.log(this)
    //console.log(d)
}
function hidediv(d) {
    $('#mpopup').hide()

    //$('.boom').hide()
    //$(this).append("<div class='boom'>Hello</div>")
    //console.log(this)
    //console.log(d)
}
function dorightclick(d) {
    return
    /*
    console.log(d)
    console.log($(d))
    console.log($(d).attr('parent'))    
    $(d).css({fill:'red'})
    */
}

function doclick(d) {
    /*
    if(($(this).is('g') && $(this).find('circle').hasClass('has_vul')) ||
       ($(this).hasClass('has_vul'))) {
	showdiv(d)
	return
    }
    */
    
    if (d.children) {
	d._children = d.children;
	d.children = null;
    } else {
	d.children = d._children;
	d._children = null;
    }
    update(d);
}


function grapharray(array){
    var map = {};
    for(var i = 0; i < array.length; i++){
	var obj = array[i];
	obj.children= [];

	map[obj.name] = obj;

	var parent = obj.parent || '-';
	if(!map[parent]){
	    map[parent] = {
		children: []
	    };
	}
	map[parent].children.push(obj);
    }

    return map['-'].children;
}
function timefile() {
    var d = new Date();
    return d.getDate()  + "-" + (d.getMonth()+1) + "-" + d.getFullYear() + "-" +
	d.getHours() + "-" + d.getMinutes()
    
}
function showme(divid,vul_flag) {
    $('.scontent').hide()
    $(divid).show()
    if(vul_flag)
	$('#vuls').removeClass('d-none')
    else
	$('#vuls').addClass('d-none')
}
function add_heatmap(cvss_score) {
    $('#heatmap').remove()
    $('#graph').append('<table align="center" id="heatmap" style="font-size:14px">'+
		       '<thead><tr><th colspan="2" style="text-align:center">CVSS '+
		       'Color Map</th></tr><tbody><tr><td colspan="2" id="heatbar"></td></tr>'+
		       '<tr><td>0.1</td><td style="text-align: right;">10.0'+
		       '</td></tr></tbody></table>')
    for (var i=0; i<101; i++) {
	var cscore = (i*0.1).toFixed(2)
	var x=$('<div style="display:inline">&nbsp;</div>')
	    .css({width:'1px',height:'20px',background:'rgb(255,'+String(200-2*i)+',0)'})
	    .attr('title',cscore)
	if(cscore >= cvss_score) {
	    x.html('&wedge;').css({color:'white',background:'black'})
	    /* Empty it out once copied */
	    cvss_score = 100
	}
	$('#heatbar').append(x)
    }
}
function simulate_vuls() {
    $('.invalid-feedback').remove()
    var pratio = parseFloat($('#pratio').val())
    var vul_rows = $('#vul_table .vul_template').not('.d-none')
    if(!vul_rows.length) {
	if(vul_data.length > 0) {
	    if(confirm("Clear all current simulated vulnerabilities?")) {
		vul_data=[]
		$('circle').removeData().css({fill: 'rgb(255,255,255)'}).removeClass('has_vul')
		$('#vul_table').modal('hide')
		return
	    }
	}
	alert("Nothing to add")
	return
    }
    vul_data = []
    for(var j=0; j<vul_rows.length; j++) {
	var inputs = $(vul_rows[j]).find(":input").not("button")
	for (var i=0; i< inputs.length; i++) {
	    if(!$(inputs[i]).val()) {
		add_invalid_feedback(inputs[i],"")
		return false
	    }
	}
	var vid = parseInt($(vul_rows[j]).find(".vul_part").val())
	var cve = $(vul_rows[j]).find(".cve").val()
	var cvss_score = parseFloat($(vul_rows[j]).find(".cvss_score").val())
	if(isNaN(cvss_score) || (cvss_score <= 0) || (cvss_score > 10)) {
	    add_invalid_feedback($(vul_rows[j]).find(".cvss_score"),"CVSS Score should be between 0.1 and 10.0")
	    return false
	}
	$('#vul_table').modal('hide')
	var vul_d = {vul_part:vid,cvss_score:cvss_score,cve:cve} 
	vul_data.push(vul_d)
	/* find children relationships using ID property */
	//var vcid = vid
	//console.log(vid)
	//console.log(vcid)
	//populate_vuls(vul_d)
	$('circle[sid='+vid+']').css({fill:'rgb('+cvss_tocolor(cvss_score)+')'})
	    .data(vul_d).addClass('has_vul')
	setTimeout(function() {
	    add_color_child(vid,cvss_score*pratio,vul_d)}, 400)
	setTimeout( function () {
	    add_color_parent(vid,cvss_score*pratio,vul_d)}, 500)	
    }
    add_heatmap(cvss_score)
}
function add_color_child(vid,cvss_score,vul_d) {
    var vcid = alltreeData.findIndex(x => x.id == vid)
    if(!('children' in alltreeData[vcid]))
	return
    for(var i=0; i<alltreeData[vcid].children.length; i++) {
	var tvcid = alltreeData[vcid].children[i]['id']
	console.log(tvcid)
	$('circle[sid='+tvcid+']').css({fill:'rgb('+cvss_tocolor(cvss_score)+')'})
	    .data(vul_d).addClass('has_vul')
	add_color_child(tvcid,cvss_score,vul_d)
    }
}
function add_color_parent(vid,cvss_score,vul_d) {
    var vcid = alltreeData.findIndex(x => x.id == vid) 
    //console.log(vcid)
    if(!alltreeData[vcid]) return
    var tnode = alltreeData[vcid]
    if(!('parent' in tnode))
	return
    if(!tnode['parent'])
	return
    if(!('id' in tnode['parent']))
	return
    var pratio = parseFloat($('#pratio').val())    
    var tvcid = tnode['parent']['id']
    $('circle[sid='+tvcid+']').css({fill:'rgb('+cvss_tocolor(cvss_score)+')'})
	.data(vul_d).addClass('has_vul')
    setTimeout( function () {
	add_color_parent(tvcid,cvss_score*pratio,vul_d)}, 400)
}
function vul_modal() {
    $('#vul_table').modal()
    /* Remove all pending add vul rows */
    $('.vul_template').not('.d-none').remove()
    /* Provide an empty form for new entry then load the current data */
    add_vul()
    load_vuls()    

}
function load_vuls() {
    for(var i=0; i<vul_data.length; i++) {
	var ovul = $('.vul_template.d-none').clone().removeClass('d-none')
	var fselect = ovul.find("select")
	/* Add everything that has a parent and a name, ignore the root */
	alltreeData.map(x => { if(x.name && x.parent) fselect.append(new Option(x.name,x.id))})
	for (k in vul_data[i])
	    ovul.find("."+k).val(vul_data[i][k])
	$('#vul_table .row').after(ovul)
    }
}
function remove_vul(w) {
    var rvul = $(w).parent()
    rvul.remove()
}
function add_vul() {
    //<p class="vul_template d-none">
    var nvul = $('.vul_template.d-none').clone().removeClass('d-none')
    var fselect = nvul.find("select")
    /* Add everything that has a parent and a name, ignore the root */
    alltreeData.map(x => { if(x.name && x.parent) fselect.append(new Option(x.name,x.id))})
    $('#vul_table .modal-body').append(nvul)

}
function cvss_tocolor(cvss) {
    var ncvs = parseFloat(cvss).toFixed(2)
    /* rgb match sent as a string of number r,g,b */
    return [255,200-(ncvs*20),0].join(",")
}
function cve_check(w) {
/* 
Provide CVE browsing capability.
https://cve.circl.lu/api/cve/CVE-2010-3333 
https://olbat.github.io/nvdcve/CVE-2017-1000369.json

*/
    var cve = w.value.toUpperCase()
    if(!cve.match(/^CVE\-\d{4}\-\d{4,}$/)) {
	add_invalid_feedback(w,"CVE score should be properly formatted")
	return
    }
    $.getJSON("https://olbat.github.io/nvdcve/"+cve+".json",function(data) {
	cve_data.push(data)
	if("impact" in data) {
	    if(("baseMetricV3" in data.impact) && ("cvssV3" in data.impact.baseMetricV3) &&
	       ("baseScore" in data.impact.baseMetricV3.cvssV3)) {
		console.log(data.impact.baseMetricV3.cvssV3.baseScore)
		add_valid_feedback($(w).closest('input'),"Mitre Score is "+data.impact.baseMetricV3.cvssV3.baseScore)
	    }
	}
    }).done(function() {
	console.log( "second success" );
    }).fail(function() {
	console.log( "error" );
	
	add_invalid_feedback(w,"Warning: CVE not found")
    }).always(function() {
	console.log( "complete" );
    });
}