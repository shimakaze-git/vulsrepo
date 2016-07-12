var vulsrepo = {
	jsonFile : "current/all.json",
	rawData : null,
	link : {
		mitre : {
			url : "https://cve.mitre.org/cgi-bin/cvename.cgi",
			disp : "MITRE",
			find : "RESERVED"
		},
		cve : {
			url : "http://www.cvedetails.com/cve/",
			disp : "CveDetails",
			find : "Unknown CVE ID"
		},
		nvd : {
			url : "https://web.nvd.nist.gov/view/vuln/detail",
			disp : "NVD",
			find : "CVE ID Not Found"
		},
		jvn : {
			url : "http://jvndb.jvn.jp/search/index.php?mode=_vulnerability_search_IA_VulnSearch&keyword=",
			disp : "JVN",
			find : "Not found"
		},
		cvss : {
			url : "https://nvd.nist.gov/cvss/v2-calculator",
			disp : "CVSSv2 Caluclator",
			find : "Warning: Unable to find vulnerability requested."
		},
		rhel : {
			url : "https://access.redhat.com/security/cve/",
			disp : "RHEL",
			find : "Not Found"
		},
		debian : {
			url : "https://security-tracker.debian.org/tracker/",
			disp : "Debian",
			find : "DO NOT USE THIS CANDIDATE NUMBER"
		},
		ubuntu : {
			url : "https://people.canonical.com/~ubuntu-security/cve/",
			disp : "Ubuntu",
			find : "DO NOT USE THIS CANDIDATE NUMBER"
		}
	}
};

var demo = [
		{
			key : '1. Graph:ServerName->Score',
			value : '{"derivedAttributes":{},"aggregators":{},"renderers":{},"hiddenAttributes":[],"menuLimit":3000,"cols":["Container"],"rows":["CVSS Severity"],"vals":[],"exclusions":{},"inclusions":{},"unusedAttrsVertical":85,"autoSortUnusedAttrs":false,"rendererOptions":{"localeStrings":{"renderError":"An error occurred rendering the PivotTable results.","computeError":"An error occurred computing the PivotTable results.","uiRenderError":"An error occurred rendering the PivotTable UI.","selectAll":"Select All","selectNone":"Select None","tooMany":"(too many to list)","filterResults":"Filter results","totals":"Totals","vs":"vs","by":"by"}},"localeStrings":{"renderError":"An error occurred rendering the PivotTable results.","computeError":"An error occurred computing the PivotTable results.","uiRenderError":"An error occurred rendering the PivotTable UI.","selectAll":"Select All","selectNone":"Select None","tooMany":"(too many to list)","filterResults":"Filter results","totals":"Totals","vs":"vs","by":"by"},"aggregatorName":"Count","rendererName":"Stacked Bar Chart","inclusionsInfo":{}}'
		},
		{
			key : '2. Pivot:Packages->CveID->Summary',
			value : '{"derivedAttributes":{},"aggregators":{},"renderers":{},"hiddenAttributes":[],"menuLimit":3000,"cols":["Container"],"rows":["Packages","CveID"],"vals":[],"exclusions":{},"inclusions":{},"unusedAttrsVertical":85,"autoSortUnusedAttrs":false,"rendererOptions":{"localeStrings":{"renderError":"An error occurred rendering the PivotTable results.","computeError":"An error occurred computing the PivotTable results.","uiRenderError":"An error occurred rendering the PivotTable UI.","selectAll":"Select All","selectNone":"Select None","tooMany":"(too many to list)","filterResults":"Filter results","totals":"Totals","vs":"vs","by":"by"}},"localeStrings":{"renderError":"An error occurred rendering the PivotTable results.","computeError":"An error occurred computing the PivotTable results.","uiRenderError":"An error occurred rendering the PivotTable UI.","selectAll":"Select All","selectNone":"Select None","tooMany":"(too many to list)","filterResults":"Filter results","totals":"Totals","vs":"vs","by":"by"},"aggregatorName":"Count","rendererName":"Heatmap","inclusionsInfo":{}}'
		} ];

$(document).ready(function() {

	$.each(demo, function(index, val) {
		localStorage.setItem("vulsrepo_pivot_conf_user_" + val.key, val.value);
	});

	setEvents();
	db.remove("vulsrepo_pivot_conf");
	pivotInitialize();

});

var pivotInitialize = function() {
	$.blockUI(blockUI_opt_all);
	getData().done(function(json_data) {
		displayPivot(createPivotData(json_data));
		setPulldown("#drop_topmenu");
		setPulldownDisplayChangeEvent("#drop_topmenu");
		filterDisp.off("pivot_conf");
		$.unblockUI(blockUI_opt_all);
	}).fail(function(jqXHR) {
		$.unblockUI(blockUI_opt_all);
		showAlert(jqXHR.status + " " + jqXHR.statusText, jqXHR.responseText);
	});
};

var db = {
	set : function(key, obj) {
		localStorage.setItem(key, JSON.stringify(obj));
	},
	get : function(key) {
		return JSON.parse(localStorage.getItem(key));
	},
	remove : function(key) {
		localStorage.removeItem(key);
	},
	setPivotConf : function(key, obj) {
		localStorage.setItem("vulsrepo_pivot_conf_user_" + key, JSON.stringify(obj));
	},
	getPivotConf : function(key) {
		return JSON.parse(localStorage.getItem("vulsrepo_pivot_conf_user_" + key));
	},
	removePivotConf : function(key) {
		localStorage.removeItem("vulsrepo_pivot_conf_user_" + key);
	},
	listPivotConf : function(key) {
		var array = [];
		for (var i = 0; i < localStorage.length; i++) {
			if (localStorage.key(i).indexOf('vulsrepo_pivot_conf_user_') != -1) {
				array.push(localStorage.key(i).replace(/vulsrepo_pivot_conf_user_/g, ''));
			}
		}
		return array;
	}
};

var filterDisp = {
	on : function(labelName) {
		$(labelName).removeClass("label-info").addClass("label-warning").text("Filter ON");
	},

	off : function(labelName) {
		$(labelName).removeClass("label-warning").addClass("label-info").text("Filter OFF");
	}
};

var fadeAlert = function(target) {
	$(target).fadeIn(1000).delay(2000).fadeOut(1000);
};

var showAlert = function(code, text) {
	$("#alert_error_code").append("<div>" + code + "</div>");
	$("#alert_responce_text").append("<div>" + text + "</div>");
	$("#modal-alert").modal('show');
};

var blockUI_opt_all = {

	message : '<h4><img src="./dist/img/loading.gif" />　Please Wait...</h4>',
	fadeIn : 200,
	fadeOut : 200,
	css : {
		border : 'none',
		padding : '15px',
		backgroundColor : '#000',
		'-webkit-border-radius' : '10px',
		'-moz-border-radius' : '10px',
		opacity : .5,
		color : '#fff'
	}
};

var getData = function() {
	var defer = new $.Deferred();
	$.ajaxSetup({
		timeout : 5 * 1000
	});
	$.getJSON(vulsrepo.jsonFile).done(function(json_data) {
		defer.resolve(json_data);
		vulsrepo.rawData = json_data;
	}).fail(function(jqXHR, textStatus, errorThrown) {
		defer.reject(jqXHR);
	});

	return defer.promise();
};

var getSeverity = function(Score) {
	if (Score >= 7.0) {
		return Array("High", "red");
	} else if ((Score < 7.0) && (Score >= 4.0)) {
		return Array("Medium", "orange");
	} else if ((Score < 4.0)) {
		return Array("Low", "#e6e600");
	}
};

var setPulldown = function(target) {
	$(target).empty();
	$.each(db.listPivotConf(), function(index, val) {
		$(target).append('<li><a href="javascript:void(0)" value=\"' + val + '\">' + val + '</a></li>');
	});

	$(target + ' a').off('click');
	$(target + ' a').on('click', function() {
		$(target + "_visibleValue").html($(this).attr('value'));
		$(target + "_hiddenValue").val($(this).attr('value'));
	});

};

var setPulldownDisplayChangeEvent = function(target) {
	$(target + ' a').on('click', function() {
		var value = db.getPivotConf($(this).attr('value'));
		db.set("vulsrepo_pivot_conf", value);
		pivotInitialize();
	});
};

var setEvents = function() {
	$("#nvd_help").tooltip({});
	// $("a[data-toggle=popover]").popover();

	$("#save_pivot_conf").click(function() {
		$("#alert_saveDiag_textbox").css("display", "none");
		$("#alert_saveDiag_dropdown").css("display", "none");
		$("#input_saveDiag").val("");
		$("#drop_saveDiag_visibleValue").html("Select setting");
		$("#drop_saveDiag_hiddenValue").val("");

		setPulldown("#drop_saveDiag");
		$("#modal-saveDiag").modal('show');
	});

	$('input[name=radio_setting]:eq(0)').click(function() {
		$("#input_saveDiag").prop("disabled", false);
		$('#drop_saveDiag_buttonGroup button').prop("disabled", true);
	});

	$('input[name=radio_setting]:eq(1)').click(function() {
		$("#input_saveDiag").prop("disabled", true);
		$('#drop_saveDiag_buttonGroup button').prop("disabled", false);
	});

	$("#ok_saveDiag").click(function() {
		var configName;
		if ($('input[name=radio_setting]:eq(0)').prop('checked')) {
			configName = $("#input_saveDiag").val();
			if (configName !== "") {
				db.setPivotConf(configName, db.get("vulsrepo_pivot_conf_tmp"));
			} else {
				$("#alert_saveDiag_textbox").css("display", "");
				return;
			}
		} else {
			configName = $("#drop_saveDiag_hiddenValue").attr('value');

			if (configName !== "") {
				db.setPivotConf(configName, db.get("vulsrepo_pivot_conf_tmp"));
			} else {
				$("#alert_saveDiag_dropdown").css("display", "");
				return;
			}

		}

		setPulldown("#drop_topmenu");
		setPulldownDisplayChangeEvent("#drop_topmenu");
		$("#drop_topmenu_visibleValue").html(configName);
		$("#drop_topnemu_hiddenValue").val(configName);

		$("#modal-saveDiag").modal('hide');
		filterDisp.on("#label_pivot_conf");
		fadeAlert("#alert_pivot_conf");

	});

	$("#cancel_saveDiag").click(function() {
		$("#modal-saveDiag").modal('hide');
	});

	$("#clear_pivot_conf").click(function() {
		db.removePivotConf($("#drop_topmenu_hiddenValue").attr('value'));
		db.remove("vulsrepo_pivot_conf");
		$("#drop_topmenu_visibleValue").html("Select setting");
		$("#drop_topnemu_hiddenValue").val("");
		filterDisp.off("#label_pivot_conf");
		fadeAlert("#alert_pivot_conf");
		pivotInitialize();
	});

	$("#Setting").click(function() {
		$("#modal-setting").modal('show');
	});

	$("[name='chkAheadUrl']").bootstrapSwitch();
	var chkAheadUrl = db.get("vulsrepo_chkAheadUrl");
	if (chkAheadUrl === "true") {
		$('input[name="chkAheadUrl"]').bootstrapSwitch('state', true, true);
	}

	$('input[name="chkAheadUrl"]').on('switchChange.bootstrapSwitch', function(event, state) {
		if (state === true) {
			db.set("vulsrepo_chkAheadUrl", "true");
		} else {
			db.remove("vulsrepo_chkAheadUrl");
		}
	});

};

var getSplitArray = function(full_vector) {
	return full_vector.replace(/\(|\)/g, '').split("/");
};

var getVector = {

	jvn : function(vector) {
		var subscore = vector.split(":");

		switch (subscore[0]) {
		case 'AV':
			switch (subscore[1]) {
			case 'L':
				return Array("LOCAL", "cvss-info");
				break;
			case 'A':
				return Array("ADJACENT_NETWORK", "cvss-warning");
				break;
			case 'N':
				return Array("NETWORK", "cvss-danger");
				break;
			}
		case 'AC':
			switch (subscore[1]) {
			case 'H':
				return Array("HIGH", "cvss-info");
				break;
			case 'M':
				return Array("MEDIUM", "cvss-warning");
				break;
			case 'L':
				return Array("LOW", "cvss-danger");
				break;
			}
		case 'Au':
			switch (subscore[1]) {
			case 'N':
				return Array("NONE", "cvss-danger");
				break;
			case 'S':
				return Array("SINGLE_INSTANCE", "cvss-warning");
				break;
			case 'M':
				return Array("MULTIPLE_INSTANCES", "cvss-info");
				break;
			}
		case 'C':
			switch (subscore[1]) {
			case 'N':
				return Array("NONE", "cvss-info");
				break;
			case 'P':
				return Array("PARTIAL", "cvss-warning");
				break;
			case 'C':
				return Array("COMPLETE", "cvss-danger");
				break;
			}
		case 'I':
			switch (subscore[1]) {
			case 'N':
				return Array("NONE", "cvss-info");
				break;
			case 'P':
				return Array("PARTIAL", "cvss-warning");
				break;
			case 'C':
				return Array("COMPLETE", "cvss-danger");
				break;
			}
		case 'A':
			switch (subscore[1]) {
			case 'N':
				return Array("NONE", "cvss-info");
				break;
			case 'P':
				return Array("PARTIAL", "cvss-warning");
				break;
			case 'C':
				return Array("COMPLETE", "cvss-danger");
				break;
			}
		}
	},

	nvd : function(category, impact) {

		switch (category) {
		case 'AV':
			switch (impact) {
			case 'LOCAL':
				return "cvss-info";
				break;
			case 'ADJACENT_NETWORK':
				return "cvss-warning";
				break;
			case 'NETWORK':
				return "cvss-danger";
				break;
			}
		case 'AC':
			switch (impact) {
			case 'HIGH':
				return "cvss-info";
				break;
			case 'MEDIUM':
				return "cvss-warning";
				break;
			case 'LOW':
				return "cvss-danger";
				break;
			}
		case 'Au':
			switch (impact) {
			case 'NONE':
				return "cvss-danger";
				break;
			case 'SINGLE_INSTANCE':
				return "cvss-warning";
				break;
			case 'MULTIPLE_INSTANCES':
				return "cvss-info";
				break;
			}
		case 'C':
			switch (impact) {
			case 'NONE':
				return "cvss-info";
				break;
			case 'PARTIAL':
				return "cvss-warning";
				break;
			case 'COMPLETE':
				return "cvss-danger";
				break;
			}
		case 'I':
			switch (impact) {
			case 'NONE':
				return "cvss-info";
				break;
			case 'PARTIAL':
				return "cvss-warning";
				break;
			case 'COMPLETE':
				return "cvss-danger";
				break;
			}
		case 'A':
			switch (impact) {
			case 'NONE':
				return "cvss-info";
				break;
			case 'PARTIAL':
				return "cvss-warning";
				break;
			case 'COMPLETE':
				return "cvss-danger";
				break;
			}
		}
	}
};

var createPivotData = function(json_data) {

	var array = [];

	$.each(json_data, function(x, x_val) {
		$.each(x_val.KnownCves, function(y, y_val) {

			var knownValue;
			if (y_val.CpeNames.length !== 0) {
				knownValue = y_val.CpeNames;
			} else {
				knownValue = y_val.Packages;
			}

			$.each(knownValue, function(p, p_val) {
				var KnownObj = {
					"ServerName" : x_val.ServerName,
					"Family" : x_val.Family,
					"Release" : x_val.Release,
					"CveID" : '<a class="cveid">' + y_val.CveDetail.CveID + '</a>',
					"Packages" : p_val.Name,
				};

				if (x_val.Platform.Name !== "") {
					KnownObj["Platform"] = x_val.Platform.Name;
				} else {
					KnownObj["Platform"] = "None";
				}

				if (x_val.Container.Name !== "") {
					KnownObj["Container"] = x_val.Container.Name;
				} else {
					KnownObj["Container"] = "None";
				}

				if (y_val.CveDetail.Jvn.Score !== 0) {
					KnownObj["CVSS Score"] = y_val.CveDetail.Jvn.Score;
					KnownObj["CVSS Severity"] = y_val.CveDetail.Jvn.Severity;
					KnownObj["Summary"] = y_val.CveDetail.Jvn.Title;

					// ex) CveDetail.Jvn.Vector (AV:A/AC:H/Au:N/C:N/I:P/A:N)
					var arrayVector = getSplitArray(y_val.CveDetail.Jvn.Vector);
					KnownObj["CVSS (AV)"] = getVector.jvn(arrayVector[0])[0];
					KnownObj["CVSS (AC)"] = getVector.jvn(arrayVector[1])[0];
					KnownObj["CVSS (Au)"] = getVector.jvn(arrayVector[2])[0];
					KnownObj["CVSS (C)"] = getVector.jvn(arrayVector[3])[0];
					KnownObj["CVSS (I)"] = getVector.jvn(arrayVector[4])[0];
					KnownObj["CVSS (A)"] = getVector.jvn(arrayVector[5])[0];
				} else if (y_val.CveDetail.Nvd.Score !== 0) {
					KnownObj["CVSS Score"] = y_val.CveDetail.Nvd.Score;
					KnownObj["CVSS Severity"] = getSeverity(y_val.CveDetail.Nvd.Score)[0];
					KnownObj["Summary"] = y_val.CveDetail.Nvd.Summary;
					KnownObj["CVSS (AV)"] = y_val.CveDetail.Nvd.AccessVector;
					KnownObj["CVSS (AC)"] = y_val.CveDetail.Nvd.AccessComplexity;
					KnownObj["CVSS (Au)"] = y_val.CveDetail.Nvd.Authentication;
					KnownObj["CVSS (C)"] = y_val.CveDetail.Nvd.ConfidentialityImpact;
					KnownObj["CVSS (I)"] = y_val.CveDetail.Nvd.IntegrityImpact;
					KnownObj["CVSS (A)"] = y_val.CveDetail.Nvd.AvailabilityImpact;
				}

				array.push(KnownObj);

			});

		});

		$.each(x_val.UnknownCves, function(y, y_val) {

			var unknownValue;
			if (y_val.CpeNames !== null) {
				unknownValue = y_val.CpeNames;
			} else {
				unknownValue = y_val.Packages;
			}

			$.each(unknownValue, function(p, p_val) {
				var UnknownObj = {
					"ServerName" : x_val.ServerName,
					"Family" : x_val.Family,
					"Release" : x_val.Release,
					"CveID" : '<a class="cveid">' + y_val.CveDetail.CveID + '</a>',
					"Packages" : p_val.Name,
					"CVSS Score" : "Unknown",
					"CVSS Severity" : "Unknown",
					"Summary" : "Unknown",
					"CVSS (AV)" : "Unknown",
					"CVSS (AC)" : "Unknown",
					"CVSS (Au)" : "Unknown",
					"CVSS (C)" : "Unknown",
					"CVSS (I)" : "Unknown",
					"CVSS (A)" : "Unknown"
				};

				if (x_val.Platform.Name !== "") {
					UnknownObj["Platform"] = x_val.Platform.Name;
				} else {
					UnknownObj["Platform"] = "None";
				}

				if (x_val.Container.Name !== "") {
					UnknownObj["Container"] = x_val.Container.Name;
				} else {
					UnknownObj["Container"] = "None";
				}

				array.push(UnknownObj);
			});
		});
	});

	return array;
};

var displayPivot = function(array) {

	var derivers = $.pivotUtilities.derivers;
	// var renderers = $.extend($.pivotUtilities.renderers,$.pivotUtilities.c3_renderers, $.pivotUtilities.d3_renderers);
	var renderers = $.extend($.pivotUtilities.renderers, $.pivotUtilities.c3_renderers);
	var dateFormat = $.pivotUtilities.derivers.dateFormat;
	var sortAs = $.pivotUtilities.sortAs;

	var pivot_attr = {
		renderers : renderers,
		menuLimit : 3000,
		rows : [ "ServerName", "Container" ],
		cols : [ "CVSS Severity", "CVSS Score" ],
		vals : [ "" ],
		exclusions : "",
		aggregatorName : "Count",
		rendererName : "Heatmap",
		sorters : function(attr) {
			if (attr == "CVSS Severity") {
				return sortAs([ "Low", "Medium", "High", "Unknown" ]);
			}

		},
		onRefresh : function(config) {
			db.set("vulsrepo_pivot_conf_tmp", config);
			$('.cveid').on('click', function() {
				displayDetail(this.text);
			});
			$("#pivot_base").find(".pvtVal[data-value='null']").css("background-color", "palegreen");
		}

	};

	var pivot_obj = db.get("vulsrepo_pivot_conf");
	if (pivot_obj != null) {
		pivot_attr["rows"] = pivot_obj["rows"];
		pivot_attr["cols"] = pivot_obj["cols"];
		pivot_attr["vals"] = pivot_obj["vals"];
		pivot_attr["exclusions"] = pivot_obj["exclusions"];
		pivot_attr["aggregatorName"] = pivot_obj["aggregatorName"];
		pivot_attr["rendererName"] = pivot_obj["rendererName"];
		filterDisp.on("#label_pivot_conf");
	} else {
		filterDisp.off("#label_pivot_conf");
	}

	$("#pivot_base").pivotUI(array, pivot_attr, {
		overwrite : "true"
	});

};

var createDetailData = function(th) {

	var targetObj;

	$.each(vulsrepo.rawData, function(x, x_val) {
		$.each(x_val.KnownCves, function(y, y_val) {
			if (th === y_val.CveDetail.CveID) {
				targetObj = y_val.CveDetail;
			}
		});

		$.each(x_val.UnknownCves, function(y, y_val) {
			if (th === y_val.CveDetail.CveID) {
				targetObj = y_val.CveDetail;
			}
		});
	});

	return targetObj;

};

var displayDetail = function(th) {

	$("#modal-label").text("");
	$("#Title").empty();
	$("#scoreText").text("").css('background-color', 'gray');
	$("#Summary").empty();
	$("#Link").empty();
	$("#References").empty();
	$("#cvss_av").removeClass().text("");
	$("#cvss_ac").removeClass().text("");
	$("#cvss_au").removeClass().text("");
	$("#cvss_c").removeClass().text("");
	$("#cvss_i").removeClass().text("");
	$("#cvss_a").removeClass().text("");

	var data = createDetailData(th);
	$("#modal-label").text(data.CveID);
	if (data.Jvn.Title !== "") {
		$("#Title").append("<div>" + data.Jvn.Title + "<div>");
	} else if (data.Nvd.Summary !== "") {
		// Do not put anything because it is the same as the summary in the case of NVD
	} else {
		$("#Title").append("<div>Unknown<div>");
	}

	if (data.Jvn.Score !== 0) {
		var arrayVector = getSplitArray(data.Jvn.Vector);
		$("#scoreText").text(data.Jvn.Score + " (" + data.Jvn.Severity + ")").css('background-color', getSeverity(data.Jvn.Score)[1]);
		$("#cvss_av").text(getVector.jvn(arrayVector[0])[0]).addClass(getVector.jvn(arrayVector[0])[1]);
		$("#cvss_ac").text(getVector.jvn(arrayVector[1])[0]).addClass(getVector.jvn(arrayVector[1])[1]);
		$("#cvss_au").text(getVector.jvn(arrayVector[2])[0]).addClass(getVector.jvn(arrayVector[2])[1]);
		$("#cvss_c").text(getVector.jvn(arrayVector[3])[0]).addClass(getVector.jvn(arrayVector[3])[1]);
		$("#cvss_i").text(getVector.jvn(arrayVector[4])[0]).addClass(getVector.jvn(arrayVector[4])[1]);
		$("#cvss_a").text(getVector.jvn(arrayVector[5])[0]).addClass(getVector.jvn(arrayVector[5])[1]);

		$("#Summary").append("<div>" + data.Jvn.Summary + "<div>");
		$("#Summary").append("<br>");

	} else if (data.Nvd.Score !== 0) {
		$("#scoreText").text(data.Nvd.Score + " (" + getSeverity(data.Nvd.Score)[0] + ")").css('background-color', getSeverity(data.Nvd.Score)[1]);
		$("#cvss_av").text(data.Nvd.AccessVector).addClass(getVector.nvd("AV", data.Nvd.AccessVector));
		$("#cvss_ac").text(data.Nvd.AccessComplexity).addClass(getVector.nvd("AC", data.Nvd.AccessComplexity));
		$("#cvss_au").text(data.Nvd.Authentication).addClass(getVector.nvd("Au", data.Nvd.Authentication));
		$("#cvss_c").text(data.Nvd.ConfidentialityImpact).addClass(getVector.nvd("C", data.Nvd.ConfidentialityImpact));
		$("#cvss_i").text(data.Nvd.IntegrityImpact).addClass(getVector.nvd("I", data.Nvd.IntegrityImpact));
		$("#cvss_a").text(data.Nvd.AvailabilityImpact).addClass(getVector.nvd("A", data.Nvd.AvailabilityImpact));

	} else {
		$("#scoreText").text("Unknown");
	}

	if (data.Nvd.Summary !== "") {
		$("#Summary").append("<div>" + data.Nvd.Summary + "<div>");
	} else {
		$("#Summary").append("<div>Unknown<div>");
	}

	addLink("#Link", vulsrepo.link.mitre.url + "?name=" + data.CveID, vulsrepo.link.mitre.disp, vulsrepo.link.mitre.find, "mitre");
	addLink("#Link", vulsrepo.link.cve.url + data.CveID, vulsrepo.link.cve.disp, vulsrepo.link.cve.find, "cve");
	addLink("#Link", vulsrepo.link.nvd.url + "?vulnId=" + data.CveID, vulsrepo.link.nvd.disp, vulsrepo.link.nvd.find, "nvd");

	var chkAheadUrl = db.get("vulsrepo_chkAheadUrl");
	if (data.Jvn.JvnLink === "") {
		$("#Link").append("<a href=\"" + vulsrepo.link.jvn.url + data.CveID + "\" target='_blank'>JVN</a>");
		if (chkAheadUrl === "true") {
			$("#Link").append("<img class='linkCheckIcon' src=\"dist/img/error.svg\"></img>");
		}

	} else {
		$("#Link").append("<a href=\"" + data.Jvn.JvnLink + "\" target='_blank'>JVN</a>");
		if (chkAheadUrl === "true") {
			$("#Link").append("<img class='linkCheckIcon' src=\"dist/img/ok.svg\"></img>");
		}
	}
	$("#Link").append("<span> / </span>");

	// addLink("#Link", vulsrepo.link.cvss.url + "?name=" + data.CveID + "&vector=" + data.Jvn.Vector, vulsrepo.link.cvss.disp, vulsrepo.link.cvss.find,"cvss");
	addLink("#Link", vulsrepo.link.rhel.url + data.CveID, vulsrepo.link.rhel.disp, vulsrepo.link.rhel.find, "rhel");
	addLink("#Link", vulsrepo.link.debian.url + data.CveID, vulsrepo.link.debian.disp, vulsrepo.link.debian.find, "debian");
	addLink("#Link", vulsrepo.link.ubuntu.url + data.CveID, vulsrepo.link.ubuntu.disp, vulsrepo.link.ubuntu.find, "ubuntu");

	if (data.Jvn.References !== null) {
		$.each(data.Jvn.References, function(x, x_val) {
			$("#References").append("<div>[" + x_val.Source + "]<a href=\"" + x_val.Link + "\" target='_blank'> (" + x_val.Link + ")</a></div>");
		});
	}
	if (data.Nvd.References !== null) {
		$.each(data.Nvd.References, function(x, x_val) {
			$("#References").append("<div>[" + x_val.Source + "]<a href=\"" + x_val.Link + "\" target='_blank'> (" + x_val.Link + ")</a></div>");
		});
	}

	$("#modal-detail").modal('show');

};

var addLink = function(target, url, disp, find, imgIdTarget) {
	$(target).append("<a href=\"" + url + "\" target='_blank'>" + disp + " </a>");
	var chkAheadUrl = db.get("vulsrepo_chkAheadUrl");
	if (chkAheadUrl === "true") {
		$(target).append("<img class='linkCheckIcon' id=imgId_" + imgIdTarget + " src=\"dist/img/loading_small.gif\"></img>");
		checkLink(url, find, "#imgId_" + imgIdTarget);
	}
	$(target).append("<span> / </span>");

};

var checkLink = function(url, find, imgId) {
	$.ajaxSetup({
		timeout : 30 * 1000
	});
	$.get(url).done(function(data, textStatus, jqXHR) {
		// console.log("done:" + imgID);
		// console.log(data);
	}).fail(function(jqXHR, textStatus, errorThrown) {
		// console.log("fail:" + imgId);
		// console.log(jqXHR);
	}).always(function(data, textStatus, jqXHR) {
		// console.log("always:" + imgId);
		// console.log(data);

		var result_text = data.results[0];
		if (result_text !== undefined) {
			if (result_text.indexOf(find) !== -1) {
				$(imgId).attr("src", "dist/img/error.svg");
			} else {
				$(imgId).attr("src", "dist/img/ok.svg");
			}
		} else {
			$(imgId).attr("src", "dist/img/error.svg");
		}
	});

};