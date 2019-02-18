/**
 * @license
 * ©2018-2019 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 */

import { html, PolymerElement } from "@polymer/polymer/polymer-element.js";
import "@polymer/iron-flex-layout/iron-flex-layout-classes.js";
import { OEAjaxMixin } from "oe-mixins/oe-ajax-mixin.js";
import "oe-input/oe-input.js";
import "@polymer/paper-button/paper-button.js";
import "@polymer/iron-icon/iron-icon.js";
import "@polymer/iron-icons/iron-icons.js";
import "@polymer/paper-tooltip/paper-tooltip.js";

/**
 * `oe-component-navigation-setting`
 *  A template element , used to create oe-ui Polymer 3 elements.
 *  By default includes `OEAjaxMixin` to support use of 'fire','async' and '_deepValue' functions.
 * 
 *
 * @customElement
 * @polymer
 * @appliesMixin OEAjaxMixin
 * @demo demo/index.html
 */
class OeComponentNavigationSetting extends OEAjaxMixin(PolymerElement) {

  static get is() { return 'oe-component-navigation-setting'; }

  static get template() {
    return html`
     <style include="iron-flex iron-flex-alignment">
     :host {
      width: 300px;
      display: block;
      height: 500px;
      position: relative;
      box-sizing: border-box;
      font-size: 14px;
      background: var(--default-primary-color);
    }

    oe-input{
      color:#FFF;
      --paper-input-container-color:#AAA;
      --paper-checkbox-label-color:#FFF;
      --paper-checkbox-checked-color:#FFF;
      --paper-checkbox-checkmark-color:var(--light-primary-color);
      --paper-input-container-focus-color:#FFF;
      --paper-input-container-shared-input-style:{
        color:#FFF;
      }
    }

    .heading-pane {
      padding: 0px 16px;
      height: 48px;
      background: var(--light-primary-color);
    }

    .main-panel {
      height: 100%;
    }

    #navForm {
      padding: 16px;
      height: calc(100% - 88px);
      overflow: auto;
      display: block;
      box-sizing: border-box;
    }

    .delete-btn {
      color: var(--error-color);
      margin-right: 8px;
    }

    .delete-btn[disabled] {
      opacity: 0.5;
    }

    .main-panel .buttons {
      border-top:1px solid var(--dark-primary-color);
      height: 40px;
      padding: 0px 16px;
    }

    .helper-text {
      margin-top: 8px;
      margin-bottom: 16px;
      display: block;
      opacity: 0.6;
      font-size: 12px;
    }

    .primary-btn {
      color: var(--default-text-color);
      background: transparent;
    }

    .secondary-btn {
      color: var(--default-text-color);
      opacity: 0.6;
      background: transparent;
    }

    iron-icon {
      --iron-icon-width: 18px;
      --iron-icon-height: 18px;
      cursor:pointer;
    }

  </style>
  <div class="main-panel">
    <div class="heading-pane layout horizontal center justified">
      <label>[[selectedComponent.name]]</label>
      <div>
        <iron-icon icon="delete" id="deleteBtn" class="delete-btn" on-tap="deleteRouteDetails"></iron-icon>
        <paper-tooltip for="deleteBtn">Delete Route and Navigation data</paper-tooltip>
      </div>
    </div>
    <div id="navForm">
      <oe-input label="UIRoute URL" value="{{routeData.UIRoute.path}}" required user-error-message='{"valueMissing":"URL is Mandatory for Navigation","patternMismatch":"URL should begin with \/ and without space"}' pattern="(\/[A-Za-z0-9-_&?=:]+)+" auto-validate id="urlInput"></oe-input>
      
      <oe-input label="Navigation Label" value="{{routeData.NavigationLink.label}}" id="navLabel" ></oe-input>
      
      <oe-input label="Navigation Parent"  value="{{routeData.NavigationLink.parent}}" id="navParent"></oe-input>
      
      <oe-input label="Navigation Group" value="{{routeData.NavigationLink.group}}" id="navGroup"></oe-input>
      
      <oe-input label="Navigation link icon" value="{{routeData.NavigationLink.icon}}"></oe-input>
    </div>
    <div class="buttons layout horizontal end-justified center">
      <paper-button class="secondary-btn" on-tap="closePanel">CANCEL</paper-button>
      <paper-button class="primary-btn" on-tap="saveRouteDetails" id="saveBtn">SAVE</paper-button>
    </div>
  </div>
     `;
  }

  static get properties() {
    return {
      selectedComponent: {
        type: Object,
        observer: "_selectedComponentChanged"
      }
    };
  }

  constructor() {
    super();
    this.routeUrl = window.OEUtils._getRestApiUrl('/UIRoutes');
    this.navigationUrl = window.OEUtils._getRestApiUrl('/NavigationLinks');
    this.routeData = {
      UIRoute:{},
      NavigationLink:{}
    };
  }

  _selectedComponentChanged(newV, oldV) {
    if (newV && newV !== oldV) {
      var self = this;
      this.routeData = {
        UIRoute:{},
        NavigationLink:{}
      };

      this.__getUIRoute(function(err,route){
        if(!err){
          if(Array.isArray(route) && route.length > 0){
            self.set("routeData.UIRoute",route[0]);
            self.__getNavigationLink(function(err2,nav){
              if(!err2){
                if(Array.isArray(nav) && nav.length > 0){
                  self.set("routeData.NavigationLink",nav[0]);
                }
              }
            });
          }
        }
      });
    }
  }

  closePanel(){
    this.fire("close-panel");
  }

  saveRouteDetails(){
    var self = this;
    if(!this.$.urlInput.validate()){
      return;
    }

    if(!self.routeData.UIRoute.id){
      self.routeData.UIRoute.type = "elem";
      self.routeData.UIRoute.name = self.selectedComponent.name;
      self.routeData.UIRoute.import = window.OEUtils._getRestApiUrl('/UIComponents/component/') + self.routeData.UIRoute.name + ".js";
    }

    self.__saveUIRoute(self.routeData.UIRoute,function(err,route){
      if(!err){
        self.set("routeData.UIRoute",route);
        if(self.routeData.NavigationLink.label){
          self.routeData.NavigationLink.url = self.routeData.UIRoute.path;

          if(!self.routeData.NavigationLink.id){
            self.routeData.NavigationLink.topLevel= true;
            self.routeData.NavigationLink.name= self.selectedComponent.name;
          }

          self.__saveNavigationLink(self.routeData.NavigationLink,function(err2,nav){
            if(!err){
              self.set("routeData.NavigationLink",nav);
              self.fire("oe-show-success","UIRoute and NavigationLink saved successfully");
              self.closePanel();
            }
          });
        }else{
          self.fire("oe-show-success","UIRoute saved successfully");
          self.closePanel();
        }
      }
    });
  }

  deleteRouteDetails(){
    var self = this;
    if(!self.routeData.UIRoute.id){
      return;
    }

    self.__deleteUIRoute(self.routeData.UIRoute,function(err1,resp){
      if(!err1){

        self.set("routeData.UIRoute",{});

        if(self.routeData.NavigationLink.id){
          self.__deleteNavigationLink(self.routeData.NavigationLink,function(err2,resp){
            if(!err2){
              self.set("routeData.NavigationLink",{});
              self.fire("oe-show-success","UIRoute and NavigationLink deleted successfully");
            }
          });
        }else{
          self.fire("oe-show-success","UIRoute deleted successfully");
        }
      }
    });
  }

  __getUIRoute(cb) {
    var self = this;
    var filter = {
      where: {
        type: "elem",
        name: this.selectedComponent.name
      }
    };
    this.makeAjaxCall(this.routeUrl, "get", null, null, {"filter":filter}, null, function (err, resp) {
      if (err) {
        self.fire("oe-show-error", "Error fetching UIRoutes");
      } 
      cb(err,resp);
    });
  }

  __getNavigationLink(cb){
    var self = this;
    var filter = {
      where: {
        url:this.routeData.UIRoute.path
      }
    };
    this.makeAjaxCall(this.navigationUrl, "get", null, null, {"filter":filter}, null, function (err, resp) {
      if (err) {
        self.fire("oe-show-error", "Error fetching Navigation links");
      } 
      cb(err,resp);
    });
  }

  __saveUIRoute(payload,cb){
    var method = payload.id ? "put" : "post";
    this.makeAjaxCall(this.routeUrl, method , payload, null, null, null, function (err, resp) {
      if (err) {
        this.fire("oe-show-error", "Error saving UIRoute");
      } 
      cb(err,resp);
    });
  }

  __saveNavigationLink(payload,cb){
    var method = payload.id ? "put" : "post";
    this.makeAjaxCall(this.navigationUrl, method , payload, null, null, null, function (err, resp) {
      if (err) {
        this.fire("oe-show-error", "Error saving Navigation Link");
      } 
      cb(err,resp);
    });
  }

  __deleteUIRoute(payload,cb){
    var url = this.routeUrl + "/" + payload.id + "/" + payload._version;
    this.makeAjaxCall(url, "delete" , null, null, null, null, function (err, resp) {
      if (err) {
        this.fire("oe-show-error", "Error deleting UIRoute");
      } 
      cb(err,resp);
    });
  }

  __deleteNavigationLink(payload,cb){
    var url = this.navigationUrl + "/" + payload.id + "/" + payload._version;
    this.makeAjaxCall(url, "delete" , null, null, null, null, function (err, resp) {
      if (err) {
        this.fire("oe-show-error", "Error deleting Navigation Link");
      } 
      cb(err,resp);
    });
  }

}

window.customElements.define(OeComponentNavigationSetting.is, OeComponentNavigationSetting);