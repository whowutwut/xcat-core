/**
 * Global variables
 */
var provisionTabs; // Provision tabs

/**
 * Set the provision tab
 * 
 * @param obj
 *            Tab object
 * @return Nothing
 */
function setProvisionTab(obj) {
	provisionTabs = obj;
}

/**
 * Get the provision tab
 * 
 * @param Nothing
 * @return Tab object
 */
function getProvisionTab() {
	return provisionTabs;
}

/**
 * Load provision page
 * 
 * @return Nothing
 */
function loadProvisionPage() {
	// If the page is loaded
	if ($('#content').children().length) {
		// Do not load again
		return;
	}

	// Get OS image names
	if (!$.cookie('imagenames')){
		$.ajax( {
			url : 'lib/cmd.php',
			dataType : 'json',
			data : {
				cmd : 'tabdump',
				tgt : '',
				args : 'osimage',
				msg : ''
			},

			success : setOSImageCookies
		});
	}

	// Get groups
	if (!$.cookie('groups')){
		$.ajax( {
			url : 'lib/cmd.php',
			dataType : 'json',
			data : {
				cmd : 'extnoderange',
				tgt : '/.*',
				args : 'subgroups',
				msg : ''
			},

			success : setGroupsCookies
		});
	}
	
	// Create info bar
	var infoBar = createInfoBar('Select a platform to provision or re-provision a node on, then click Ok.');
	
	// Create provision page
	var provPg = $('<div class="form"></div>');
	provPg.append(infoBar);

	// Create provision tab
	var tab = new Tab();
	setProvisionTab(tab);
	tab.init();
	$('#content').append(tab.object());

	// Create radio buttons for platforms
	var hwList = $('<ol>Platforms available:</ol>');
	var ipmi = $('<li><input type="radio" name="hw" value="ipmi" checked/>iDataPlex</li>');
	var blade = $('<li><input type="radio" name="hw" value="blade"/>BladeCenter</li>');
	var hmc = $('<li><input type="radio" name="hw" value="hmc"/>System p</li>');
	var zvm = $('<li><input type="radio" name="hw" value="zvm"/>System z</li>');

	hwList.append(ipmi);
	hwList.append(blade);
	hwList.append(hmc);
	hwList.append(zvm);
	provPg.append(hwList);

	/**
	 * Ok
	 */
	var okBtn = createButton('Ok');
	okBtn.bind('click', function(event) {
		// Get hardware that was selected
		var hw = $(this).parent().find('input[name="hw"]:checked').val();
	    var newTabId = hw + 'ProvisionTab';

	    if ($('#' + newTabId).size() > 0){
	        tab.select(newTabId);
	    }
	    else{
	        var tabtitle = '';
	        
	     // Create an instance of the plugin
	        var plugin;
	        switch (hw) {
	        case "blade":
	            plugin = new bladePlugin();
	            tabtitle = 'Blade';
	            break;
	        case "hmc":
	            plugin = new hmcPlugin();
	            tabtitle = 'System P';
	            break;
	        case "ipmi":
	            plugin = new ipmiPlugin();
	            tabtitle = 'System X';
	            break;
	        case "zvm":
	            plugin = new zvmPlugin();
	            tabtitle = 'zVM';
	            break;
	        }

	        // Select tab
	        tab.add(newTabId, tabtitle, '', true);
	        tab.select(newTabId);
	        plugin.loadProvisionPage(newTabId);
	    }
	});
	provPg.append(okBtn);

	// Add provision tab
	tab.add('provisionTab', 'Provision', provPg, false);
	
	// Add image tab
	var loader = $('<center></center>').append(createLoader(''));
	tab.add('imagesTab', 'Images', loader, false);
	loadImagesPage();
	
	//should open the quick provision tab
	if (window.location.search){
	    tab.add('quickProvisionTab', 'Quick Provision', '', true);
	    tab.select('quickProvisionTab');
	    
	    var provForm = $('<div class="form"></div>');
	    $('#quickProvisionTab').append(provForm);
	    createProvision('quick', provForm);
	}
}