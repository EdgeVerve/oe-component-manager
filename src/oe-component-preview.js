/**
 * @license
 * ©2018-2019 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 */
import { html, PolymerElement } from "@polymer/polymer/polymer-element.js";
import "@polymer/iron-flex-layout/iron-flex-layout-classes.js";
import "@polymer/iron-flex-layout/iron-flex-layout.js";
import { OEAjaxMixin } from "oe-mixins/oe-ajax-mixin.js";
import "oe-utils/oe-utils.js";

/**
 * `oe-component-preview`
 *  A template element , used to create oe-ui Polymer 3 elements.
 *  By default includes `OECommonMixin` to support use of 'fire','async' and '_deepValue' functions.
 * 
 *
 * @customElement
 * @polymer
 * @appliesMixin OECommonMixin
 * @demo demo/index.html
 */
class OeComponentPreview extends OEAjaxMixin(PolymerElement) {
  static get is() {
    return 'oe-component-preview';
  }

  static get template() {
    return html`
    <style include="iron-flex">
             :host {
                position: relative;
                display: block;
                box-sizing: border-box;
                background: #DDD;
                padding: 8px;
                --hover-color: blue;
                --selection-color: orange;
            }


            #previewBox{
                height:100%;
                width:100%;
                box-sizing: border-box;
                padding: 16px;
                background: #FFF;
                overflow: auto;
            }

            .current-selection:before {
                background: var(--selection-color);
            }

            .empty-state {
                height: 100%;
                text-align: center;
                box-sizing: border-box;
                padding: 16px;
                background: #FFF;
            }

            .empty-state .main-label {
                font-size: 24px;
                font-family: 'Roboto-Light';
            }

            .empty-state .sub-label {
                font-size: 12px;
                margin-top: 8px;
            }

            .empty-state-icon {
                height: 40px;
                width: 40px;
            }
            [hidden]{
                display:none !important;
            }
        </style>
        <div id="previewBox" hidden="[[!__hasValue(component.id)]]"></div>
        <div class="empty-state layout vertical center-center" hidden="[[__hasValue(component.id)]]">
            <iron-icon icon="assignment" class="empty-state-icon"></iron-icon>
            <div class="main-label">Manage your Forms</div>
            <div class="sub-label">Create/Select a Form from the bottom panel to start</div>
        </div>
    `;
  }

  static get properties() {
    return {
      component: {
        type: Object,
        observer: '_componentChanged'
      },
      templateContainers: {
        type: Array,
        value: function () {
          return [];
        },
        notify: true
      },
      metaData: {
        type: Object,
        notify: true
      }
    };
  }

  _componentChanged(newV, oldV) {
    if (this.component && newV !== oldV) {
      this.makeXhrCall(window.OEUtils._getRestApiUrl('/UIComponents/simulate'), 'post', this.component, null, function (err, res) {
        if (err) {
          this.resolveError(err);
        } else {
          var lines = res.split('\n');
          var target = new RegExp('OEUtils\\.metadataCache\\["' + this.component.name + '"\\]\\s*\\=(.*);');
          var metaLine = lines.find(function (s) {
            return s.match(target);
          });
          var metaStr = "null";
          if (metaLine) {
            metaStr = metaLine.match(target)[1].trim();
          }
          try {
            this.metaData = JSON.parse(metaStr);
          } catch (e) { 
            this.fire("oe-show-error","Error extracting metadata");
          }
                    this._createElement(res);
                }
            }.bind(this));
        }
    }

    _createElement(scriptStr) {
        //Remove code before import
        var startIdx = scriptStr.match(/^import|^class/m).index;
        scriptStr = scriptStr.slice(startIdx);
        var OEUtils = window.OEUtils;
        this.previewEleName = this.component.name + '-' + OEUtils.generateGuid();
        var eleClassName = scriptStr.match(/^class\s([a-zA-Z0-9]+)/m)[1];

        scriptStr = scriptStr.replace(new RegExp('is:\\s"' + this.component.name + '"'),
        'is:"' + this.previewEleName + '"');

        scriptStr = scriptStr.replace(/window\.customElements\.(meta|define)/gm, '//window.customeElements.define');
        scriptStr += "\n\nwindow.previewPolymerClass(" + eleClassName + ");";

    window.previewPolymerClass = this._previewPolymerClass.bind(this);

        var dynamicScript = document.createElement('script');
        dynamicScript.setAttribute('charset', 'utf-8');
        dynamicScript.setAttribute('type', 'module');
        dynamicScript.innerHTML = scriptStr;
        this.$.previewBox.innerHTML = "";
        this.$.previewBox.appendChild(dynamicScript);
    }

  _previewPolymerClass(classObj) {
    this._previewClass = classObj;
        var template = classObj.template;

        var templateContainers = [].map.call(template.content.querySelectorAll('[id]'), function (d) {
            return d.getAttribute('id');
        });

        if (this.metaData && this.metaData.container && Array.isArray(this.metaData.container.steps)) {
            this.metaData.container.steps.forEach(function (step) {
                step.id && templateContainers.push(step.id);
            });
        }
        this.set('templateContainers', templateContainers);

        var previewClass = class extends classObj{
            static get template(){
                return html`
                <style>
                    :host{
                      display: block !important;
                      position:relative !important;
                    }
                    [field-id] {
                        position: relative;
                    }
            
                    [field-id]:hover {
                        outline: 2px solid var(--hover-color);
                        outline-offset: -2px;
                        position: relative;
                    }
            
                    .current-selection {
                        outline: 2px solid var(--selection-color);
                        outline-offset: -2px;
                    }
            
                    [field-id]:hover:before,
                    .current-selection:before {
                        content: attr(field-id);
                        position: absolute;
                        padding: 4px;
                        font-size: 10px;
                        color: #FFF;
                        top: 0px;
                        left: 0px;
                    }
            
                    [field-id]:hover:before {
                        background: var(--hover-color);
                    }
            
                    .current-selection:before {
                        background: var(--selection-color);
                    }
                </style>
                ${super.template}
                `;
            }

            constructor(){
                super();
                this.addEventListener('click',this._handlePreviewClick.bind(this));
            }

            _handlePreviewClick(e){
                var targetField = [].find.call(e.path, function (ele) {
                    return ele && (ele !== this) && ele.hasAttribute && ele.hasAttribute('field-id');
                }.bind(this));
                var prev = this.shadowRoot.querySelector('.current-selection');
                if (prev) {
                    prev.classList.remove('current-selection');
                }
                if (targetField) {
                    targetField.classList.add('current-selection');
                    this.fire('show-field-setting', targetField.getAttribute('field-id'));
                } else {
                    this.fire('show-field-setting', null);
                }
            }
        };


        this._previewEl = document.createElement(this.previewEleName);
        this.$.previewBox.appendChild(this._previewEl);

        window.OEUtils.metadataCache[this.previewEleName] = this.metaData;
        window.customElements.metadefine(this.previewEleName,previewClass);
    }

    __hasValue(val){
        return !!val;
    }
    
}

window.customElements.define(OeComponentPreview.is, OeComponentPreview);