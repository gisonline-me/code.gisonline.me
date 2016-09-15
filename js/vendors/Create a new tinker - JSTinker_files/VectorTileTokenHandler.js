// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See http://js.arcgis.com/4.0/esri/copyright.txt for details.
//>>built
define(["../../core/declare"],function(d){return d([],{constructor:function(){this._credentials=[]},addCredential:function(a){if(a&&(a.url&&a.token)&&!this.findCredential(a.url)){var b=this._getServiceRoot(a.url);b&&this._credentials.push({rootUrl:b,token:a.token})}},findCredential:function(a){if(!a||!this._credentials.length)return null;var b=-1,c=this._credentials,d=this._getServiceRoot(a);c.some(function(a,c){if(a.rootUrl===d)return b=c,!0});return-1<b?c[b]:null},_getServiceRoot:function(a){var b=
/(.+\/rest\/services\/.*\/?vectortileserver)/i,c=/(.+\/sharing\/.*)/i;return b.test(a)?a.match(b)[1]:c.test(a)?a.match(c)[1]:null}})});