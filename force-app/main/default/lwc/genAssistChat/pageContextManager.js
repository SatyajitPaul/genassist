/**
 * @description Module for handling page context information
 */
export default class PageContextManager {
    currentPageInfo = {};
    objectApiName;
    recordId;
    userName = '';
    
    /**
     * Process page reference and extract context information
     * @param {Object} pageRef - Current page reference
     * @param {String} userName - Current user name
     */
    processPageReference(pageRef, userName) {
        // Initialize with common properties
        this.currentPageInfo = {
            url: window.location.href,
            appName: document.title,
            timestamp: new Date().toISOString(),
            userName: userName || ''
        };
        
        if (!pageRef) return this.currentPageInfo;
        
        // Add page reference type
        this.currentPageInfo.pageRefType = pageRef.type;
        
        // Process based on page type
        switch(pageRef.type) {
            case 'standard__objectPage':
                this.processObjectPage(pageRef);
                break;
            case 'standard__recordPage':
                this.processRecordPage(pageRef);
                break;
            case 'standard__navItemPage':
                this.processNavItemPage(pageRef);
                break;
            case 'standard__app':
                this.processAppPage(pageRef);
                break;
            case 'standard__component':
                this.processComponentPage(pageRef);
                break;
            case 'comm__namedPage':
            case 'standard__namedPage':
                this.processNamedPage(pageRef);
                break;
            default:
                this.processGenericPage(pageRef);
        }
        
        // Add any state parameters if present
        if (pageRef.state) {
            this.currentPageInfo.state = {...pageRef.state};
        }
        
        // Add any query parameters if present
        if (pageRef.attributes && pageRef.attributes.urlParams) {
            this.currentPageInfo.queryParameters = {...pageRef.attributes.urlParams};
        }
        
        return this.currentPageInfo;
    }
    
    /**
     * Process object page information
     * @param {Object} pageRef - Page reference
     */
    processObjectPage(pageRef) {
        const { objectApiName, actionName } = pageRef.attributes;
        this.objectApiName = objectApiName;
        
        this.currentPageInfo = {
            ...this.currentPageInfo,
            pageType: 'Object Page',
            objectApiName: objectApiName,
            actionName: actionName || 'home', // home, list, new
            isListView: actionName === 'list',
            listViewId: pageRef.state?.filterName || '',
            isObjectHome: !actionName || actionName === 'home',
            isNewRecord: actionName === 'new'
        };
    }
    
    /**
     * Process record page information
     * @param {Object} pageRef - Page reference
     */
    processRecordPage(pageRef) {
        const { objectApiName, recordId, actionName } = pageRef.attributes;
        this.objectApiName = objectApiName;
        this.recordId = recordId;
        
        this.currentPageInfo = {
            ...this.currentPageInfo,
            pageType: 'Record Page',
            objectApiName: objectApiName,
            recordId: recordId,
            actionName: actionName || 'view', // view, edit, clone
            isViewMode: !actionName || actionName === 'view',
            isEditMode: actionName === 'edit',
            isCloneMode: actionName === 'clone'
        };
    }
    
    /**
     * Process navigation item page information
     * @param {Object} pageRef - Page reference
     */
    processNavItemPage(pageRef) {
        this.currentPageInfo = {
            ...this.currentPageInfo,
            pageType: 'Navigation Item Page',
            apiName: pageRef.attributes.apiName || '',
            pageName: pageRef.attributes.apiName || ''
        };
    }
    
    /**
     * Process app page information
     * @param {Object} pageRef - Page reference
     */
    processAppPage(pageRef) {
        this.currentPageInfo = {
            ...this.currentPageInfo,
            pageType: 'App Page',
            appName: pageRef.attributes.appTarget || ''
        };
    }
    
    /**
     * Process component page information
     * @param {Object} pageRef - Page reference
     */
    processComponentPage(pageRef) {
        this.currentPageInfo = {
            ...this.currentPageInfo,
            pageType: 'Component Page',
            componentName: pageRef.attributes.componentName || ''
        };
    }
    
    /**
     * Process named page information
     * @param {Object} pageRef - Page reference
     */
    processNamedPage(pageRef) {
        this.currentPageInfo = {
            ...this.currentPageInfo,
            pageType: pageRef.type === 'comm__namedPage' ? 'Community Named Page' : 'Named Page',
            pageName: pageRef.attributes.pageName || ''
        };
    }
    
    /**
     * Process generic page information
     * @param {Object} pageRef - Page reference
     */
    processGenericPage(pageRef) {
        this.currentPageInfo = {
            ...this.currentPageInfo,
            pageType: 'Other',
            pageRefDetails: JSON.parse(JSON.stringify(pageRef))
        };
    }
    
    /**
     * Get current page information
     * @returns {Object} Current page information
     */
    getCurrentPageInfo() {
        return this.currentPageInfo;
    }
}