(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory((global.atlas = global.atlas || {}, global.atlas.service = {})));
}(this, function (exports) { 'use strict';

    // Copyright (c) Microsoft Corporation. All rights reserved.
    // Licensed under the MIT License. See License.txt in the project root for license information.
    /**
     * A collection of HttpHeaders that can be sent with a HTTP request.
     */
    function getHeaderKey(headerName) {
        return headerName.toLowerCase();
    }
    /**
     * A collection of HTTP header key/value pairs.
     */
    var HttpHeaders = /** @class */ (function () {
        function HttpHeaders(rawHeaders) {
            this._headersMap = {};
            if (rawHeaders) {
                for (var headerName in rawHeaders) {
                    this.set(headerName, rawHeaders[headerName]);
                }
            }
        }
        /**
         * Set a header in this collection with the provided name and value. The name is
         * case-insensitive.
         * @param headerName The name of the header to set. This value is case-insensitive.
         * @param headerValue The value of the header to set.
         */
        HttpHeaders.prototype.set = function (headerName, headerValue) {
            this._headersMap[getHeaderKey(headerName)] = { name: headerName, value: headerValue.toString() };
        };
        /**
         * Get the header value for the provided header name, or undefined if no header exists in this
         * collection with the provided name.
         * @param headerName The name of the header.
         */
        HttpHeaders.prototype.get = function (headerName) {
            var header = this._headersMap[getHeaderKey(headerName)];
            return !header ? undefined : header.value;
        };
        /**
         * Get whether or not this header collection contains a header entry for the provided header name.
         */
        HttpHeaders.prototype.contains = function (headerName) {
            return !!this._headersMap[getHeaderKey(headerName)];
        };
        /**
         * Remove the header with the provided headerName. Return whether or not the header existed and
         * was removed.
         * @param headerName The name of the header to remove.
         */
        HttpHeaders.prototype.remove = function (headerName) {
            var result = this.contains(headerName);
            delete this._headersMap[getHeaderKey(headerName)];
            return result;
        };
        /**
         * Get the headers that are contained this collection as an object.
         */
        HttpHeaders.prototype.rawHeaders = function () {
            var result = {};
            for (var headerKey in this._headersMap) {
                var header = this._headersMap[headerKey];
                result[header.name.toLowerCase()] = header.value;
            }
            return result;
        };
        /**
         * Get the headers that are contained in this collection as an array.
         */
        HttpHeaders.prototype.headersArray = function () {
            var headers = [];
            for (var headerKey in this._headersMap) {
                headers.push(this._headersMap[headerKey]);
            }
            return headers;
        };
        /**
         * Get the header names that are contained in this collection.
         */
        HttpHeaders.prototype.headerNames = function () {
            var headerNames = [];
            var headers = this.headersArray();
            for (var i = 0; i < headers.length; ++i) {
                headerNames.push(headers[i].name);
            }
            return headerNames;
        };
        /**
         * Get the header names that are contained in this collection.
         */
        HttpHeaders.prototype.headerValues = function () {
            var headerValues = [];
            var headers = this.headersArray();
            for (var i = 0; i < headers.length; ++i) {
                headerValues.push(headers[i].value);
            }
            return headerValues;
        };
        /**
         * Get the JSON object representation of this HTTP header collection.
         */
        HttpHeaders.prototype.toJson = function () {
            return this.rawHeaders();
        };
        /**
         * Get the string representation of this HTTP header collection.
         */
        HttpHeaders.prototype.toString = function () {
            return JSON.stringify(this.toJson());
        };
        /**
         * Create a deep clone/copy of this HttpHeaders collection.
         */
        HttpHeaders.prototype.clone = function () {
            return new HttpHeaders(this.rawHeaders());
        };
        return HttpHeaders;
    }());

    // Copyright (c) Microsoft Corporation. All rights reserved.
    /**
     * Encodes a byte array in base64 format.
     * @param value the Uint8Aray to encode
     */
    function encodeByteArray(value) {
        var str = "";
        for (var i = 0; i < value.length; i++) {
            str += String.fromCharCode(value[i]);
        }
        return btoa(str);
    }
    /**
     * Decodes a base64 string into a byte array.
     * @param value the base64 string to decode
     */
    function decodeString(value) {
        var byteString = atob(value);
        var arr = new Uint8Array(byteString.length);
        for (var i = 0; i < byteString.length; i++) {
            arr[i] = byteString.charCodeAt(i);
        }
        return arr;
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var rngBrowser = createCommonjsModule(function (module) {
    // Unique ID creation requires a high quality random # generator.  In the
    // browser this is a little complicated due to unknown quality of Math.random()
    // and inconsistent support for the `crypto` API.  We do the best we can via
    // feature-detection

    // getRandomValues needs to be invoked in a context where "this" is a Crypto
    // implementation. Also, find the complete implementation of crypto on IE11.
    var getRandomValues = (typeof(crypto) != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto)) ||
                          (typeof(msCrypto) != 'undefined' && typeof window.msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto));

    if (getRandomValues) {
      // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
      var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef

      module.exports = function whatwgRNG() {
        getRandomValues(rnds8);
        return rnds8;
      };
    } else {
      // Math.random()-based (RNG)
      //
      // If all else fails, use Math.random().  It's fast, but is of unspecified
      // quality.
      var rnds = new Array(16);

      module.exports = function mathRNG() {
        for (var i = 0, r; i < 16; i++) {
          if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
          rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
        }

        return rnds;
      };
    }
    });

    /**
     * Convert array of 16 byte values to UUID string format of the form:
     * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
     */
    var byteToHex = [];
    for (var i = 0; i < 256; ++i) {
      byteToHex[i] = (i + 0x100).toString(16).substr(1);
    }

    function bytesToUuid(buf, offset) {
      var i = offset || 0;
      var bth = byteToHex;
      // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
      return ([bth[buf[i++]], bth[buf[i++]], 
    	bth[buf[i++]], bth[buf[i++]], '-',
    	bth[buf[i++]], bth[buf[i++]], '-',
    	bth[buf[i++]], bth[buf[i++]], '-',
    	bth[buf[i++]], bth[buf[i++]], '-',
    	bth[buf[i++]], bth[buf[i++]],
    	bth[buf[i++]], bth[buf[i++]],
    	bth[buf[i++]], bth[buf[i++]]]).join('');
    }

    var bytesToUuid_1 = bytesToUuid;

    function v4(options, buf, offset) {
      var i = buf && offset || 0;

      if (typeof(options) == 'string') {
        buf = options === 'binary' ? new Array(16) : null;
        options = null;
      }
      options = options || {};

      var rnds = options.random || (options.rng || rngBrowser)();

      // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
      rnds[6] = (rnds[6] & 0x0f) | 0x40;
      rnds[8] = (rnds[8] & 0x3f) | 0x80;

      // Copy bytes to buffer, if provided
      if (buf) {
        for (var ii = 0; ii < 16; ++ii) {
          buf[i + ii] = rnds[ii];
        }
      }

      return buf || bytesToUuid_1(rnds);
    }

    var v4_1 = v4;

    // Copyright (c) Microsoft Corporation. All rights reserved.
    // Licensed under the MIT License. See License.txt in the project root for license information.
    var Constants = {
        /**
         * The ms-rest version
         * @const
         * @type {string}
         */
        msRestVersion: "1.8.13",
        /**
         * Specifies HTTP.
         *
         * @const
         * @type {string}
         */
        HTTP: "http:",
        /**
         * Specifies HTTPS.
         *
         * @const
         * @type {string}
         */
        HTTPS: "https:",
        /**
         * Specifies HTTP Proxy.
         *
         * @const
         * @type {string}
         */
        HTTP_PROXY: "HTTP_PROXY",
        /**
         * Specifies HTTPS Proxy.
         *
         * @const
         * @type {string}
         */
        HTTPS_PROXY: "HTTPS_PROXY",
        HttpConstants: {
            /**
             * Http Verbs
             *
             * @const
             * @enum {string}
             */
            HttpVerbs: {
                PUT: "PUT",
                GET: "GET",
                DELETE: "DELETE",
                POST: "POST",
                MERGE: "MERGE",
                HEAD: "HEAD",
                PATCH: "PATCH"
            },
            StatusCodes: {
                TooManyRequests: 429
            }
        },
        /**
         * Defines constants for use with HTTP headers.
         */
        HeaderConstants: {
            /**
             * The Authorization header.
             *
             * @const
             * @type {string}
             */
            AUTHORIZATION: "authorization",
            AUTHORIZATION_SCHEME: "Bearer",
            /**
             * The Retry-After response-header field can be used with a 503 (Service
             * Unavailable) or 349 (Too Many Requests) responses to indicate how long
             * the service is expected to be unavailable to the requesting client.
             *
             * @const
             * @type {string}
             */
            RETRY_AFTER: "Retry-After",
            /**
             * The UserAgent header.
             *
             * @const
             * @type {string}
             */
            USER_AGENT: "User-Agent"
        }
    };

    // Copyright (c) Microsoft Corporation. All rights reserved.
    /**
     * A constant that indicates whether the environment is node.js or browser based.
     */
    var isNode = (typeof process !== "undefined") && !!process.version && !!process.versions && !!process.versions.node;
    /**
     * Returns a stripped version of the Http Response which only contains body,
     * headers and the status.
     *
     * @param {HttpOperationResponse} response The Http Response
     *
     * @return {object} The stripped version of Http Response.
     */
    function stripResponse(response) {
        var strippedResponse = {};
        strippedResponse.body = response.bodyAsText;
        strippedResponse.headers = response.headers;
        strippedResponse.status = response.status;
        return strippedResponse;
    }
    /**
     * Returns a stripped version of the Http Request that does not contain the
     * Authorization header.
     *
     * @param {WebResource} request The Http Request object
     *
     * @return {WebResource} The stripped version of Http Request.
     */
    function stripRequest(request) {
        var strippedRequest = request.clone();
        if (strippedRequest.headers) {
            strippedRequest.headers.remove("authorization");
        }
        return strippedRequest;
    }
    /**
     * Validates the given uuid as a string
     *
     * @param {string} uuid The uuid as a string that needs to be validated
     *
     * @return {boolean} True if the uuid is valid; false otherwise.
     */
    function isValidUuid(uuid) {
        var validUuidRegex = new RegExp("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$", "ig");
        return validUuidRegex.test(uuid);
    }
    /**
     * Generated UUID
     *
     * @return {string} RFC4122 v4 UUID.
     */
    function generateUuid() {
        return v4_1();
    }
    /**
     * A wrapper for setTimeout that resolves a promise after t milliseconds.
     * @param {number} t The number of milliseconds to be delayed.
     * @param {T} value The value to be resolved with after a timeout of t milliseconds.
     * @returns {Promise<T>} Resolved promise
     */
    function delay(t, value) {
        return new Promise(function (resolve) { return setTimeout(function () { return resolve(value); }, t); });
    }
    function prepareXMLRootList(obj, elementName) {
        var _a;
        if (!Array.isArray(obj)) {
            obj = [obj];
        }
        return _a = {}, _a[elementName] = obj, _a;
    }
    var validateISODuration = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;
    /**
     * Indicates whether the given string is in ISO 8601 format.
     * @param {string} value The value to be validated for ISO 8601 duration format.
     * @return {boolean} `true` if valid, `false` otherwise.
     */
    function isDuration(value) {
        return validateISODuration.test(value);
    }
    /**
     * Replace all of the instances of searchValue in value with the provided replaceValue.
     * @param {string | undefined} value The value to search and replace in.
     * @param {string} searchValue The value to search for in the value argument.
     * @param {string} replaceValue The value to replace searchValue with in the value argument.
     * @returns {string | undefined} The value where each instance of searchValue was replaced with replacedValue.
     */
    function replaceAll(value, searchValue, replaceValue) {
        return !value || !searchValue ? value : value.split(searchValue).join(replaceValue || "");
    }

    // Copyright (c) Microsoft Corporation. All rights reserved.
    var Serializer = /** @class */ (function () {
        function Serializer(modelMappers, isXML) {
            if (modelMappers === void 0) { modelMappers = {}; }
            this.modelMappers = modelMappers;
            this.isXML = isXML;
        }
        Serializer.prototype.validateConstraints = function (mapper, value, objectName) {
            var failValidation = function (constraintName, constraintValue) {
                throw new Error("\"" + objectName + "\" with value \"" + value + "\" should satisfy the constraint \"" + constraintName + "\": " + constraintValue + ".");
            };
            if (mapper.constraints && (value != undefined)) {
                var _a = mapper.constraints, ExclusiveMaximum = _a.ExclusiveMaximum, ExclusiveMinimum = _a.ExclusiveMinimum, InclusiveMaximum = _a.InclusiveMaximum, InclusiveMinimum = _a.InclusiveMinimum, MaxItems = _a.MaxItems, MaxLength = _a.MaxLength, MinItems = _a.MinItems, MinLength = _a.MinLength, MultipleOf = _a.MultipleOf, Pattern = _a.Pattern, UniqueItems = _a.UniqueItems;
                if (ExclusiveMaximum != undefined && value >= ExclusiveMaximum) {
                    failValidation("ExclusiveMaximum", ExclusiveMaximum);
                }
                if (ExclusiveMinimum != undefined && value <= ExclusiveMinimum) {
                    failValidation("ExclusiveMinimum", ExclusiveMinimum);
                }
                if (InclusiveMaximum != undefined && value > InclusiveMaximum) {
                    failValidation("InclusiveMaximum", InclusiveMaximum);
                }
                if (InclusiveMinimum != undefined && value < InclusiveMinimum) {
                    failValidation("InclusiveMinimum", InclusiveMinimum);
                }
                if (MaxItems != undefined && value.length > MaxItems) {
                    failValidation("MaxItems", MaxItems);
                }
                if (MaxLength != undefined && value.length > MaxLength) {
                    failValidation("MaxLength", MaxLength);
                }
                if (MinItems != undefined && value.length < MinItems) {
                    failValidation("MinItems", MinItems);
                }
                if (MinLength != undefined && value.length < MinLength) {
                    failValidation("MinLength", MinLength);
                }
                if (MultipleOf != undefined && value % MultipleOf !== 0) {
                    failValidation("MultipleOf", MultipleOf);
                }
                if (Pattern && value.match(Pattern) === null) {
                    failValidation("Pattern", Pattern);
                }
                if (UniqueItems && value.some(function (item, i, ar) { return ar.indexOf(item) !== i; })) {
                    failValidation("UniqueItems", UniqueItems);
                }
            }
        };
        /**
         * Serialize the given object based on its metadata defined in the mapper
         *
         * @param {Mapper} mapper The mapper which defines the metadata of the serializable object
         *
         * @param {object|string|Array|number|boolean|Date|stream} object A valid Javascript object to be serialized
         *
         * @param {string} objectName Name of the serialized object
         *
         * @returns {object|string|Array|number|boolean|Date|stream} A valid serialized Javascript object
         */
        Serializer.prototype.serialize = function (mapper, object, objectName) {
            var payload = {};
            var mapperType = mapper.type.name;
            if (!objectName) {
                objectName = mapper.serializedName;
            }
            if (mapperType.match(/^Sequence$/ig) !== null) {
                payload = [];
            }
            if (object == undefined && (mapper.defaultValue != undefined || mapper.isConstant)) {
                object = mapper.defaultValue;
            }
            // This table of allowed values should help explain
            // the mapper.required and mapper.nullable properties.
            // X means "neither undefined or null are allowed".
            //           || required
            //           || true      | false
            //  nullable || ==========================
            //      true || null      | undefined/null
            //     false || X         | undefined
            // undefined || X         | undefined/null
            var required = mapper.required, nullable = mapper.nullable;
            if (required && nullable && object === undefined) {
                throw new Error(objectName + " cannot be undefined.");
            }
            if (required && !nullable && object == undefined) {
                throw new Error(objectName + " cannot be null or undefined.");
            }
            if (!required && nullable === false && object === null) {
                throw new Error(objectName + " cannot be null.");
            }
            if (object == undefined) {
                payload = object;
            }
            else {
                // Validate Constraints if any
                this.validateConstraints(mapper, object, objectName);
                if (mapperType.match(/^any$/ig) !== null) {
                    payload = object;
                }
                else if (mapperType.match(/^(Number|String|Boolean|Object|Stream|Uuid)$/ig) !== null) {
                    payload = serializeBasicTypes(mapperType, objectName, object);
                }
                else if (mapperType.match(/^Enum$/ig) !== null) {
                    var enumMapper = mapper;
                    payload = serializeEnumType(objectName, enumMapper.type.allowedValues, object);
                }
                else if (mapperType.match(/^(Date|DateTime|TimeSpan|DateTimeRfc1123|UnixTime)$/ig) !== null) {
                    payload = serializeDateTypes(mapperType, object, objectName);
                }
                else if (mapperType.match(/^ByteArray$/ig) !== null) {
                    payload = serializeByteArrayType(objectName, object);
                }
                else if (mapperType.match(/^Base64Url$/ig) !== null) {
                    payload = serializeBase64UrlType(objectName, object);
                }
                else if (mapperType.match(/^Sequence$/ig) !== null) {
                    payload = serializeSequenceType(this, mapper, object, objectName);
                }
                else if (mapperType.match(/^Dictionary$/ig) !== null) {
                    payload = serializeDictionaryType(this, mapper, object, objectName);
                }
                else if (mapperType.match(/^Composite$/ig) !== null) {
                    payload = serializeCompositeType(this, mapper, object, objectName);
                }
            }
            return payload;
        };
        /**
         * Deserialize the given object based on its metadata defined in the mapper
         *
         * @param {object} mapper The mapper which defines the metadata of the serializable object
         *
         * @param {object|string|Array|number|boolean|Date|stream} responseBody A valid Javascript entity to be deserialized
         *
         * @param {string} objectName Name of the deserialized object
         *
         * @returns {object|string|Array|number|boolean|Date|stream} A valid deserialized Javascript object
         */
        Serializer.prototype.deserialize = function (mapper, responseBody, objectName) {
            if (responseBody == undefined) {
                if (this.isXML && mapper.type.name === "Sequence" && !mapper.xmlIsWrapped) {
                    // Edge case for empty XML non-wrapped lists. xml2js can't distinguish
                    // between the list being empty versus being missing,
                    // so let's do the more user-friendly thing and return an empty list.
                    responseBody = [];
                }
                return responseBody;
            }
            var payload;
            var mapperType = mapper.type.name;
            if (!objectName) {
                objectName = mapper.serializedName;
            }
            if (mapperType.match(/^Composite$/ig) !== null) {
                payload = deserializeCompositeType(this, mapper, responseBody, objectName);
            }
            else {
                if (this.isXML) {
                    /**
                     * If the mapper specifies this as a non-composite type value but the responseBody contains
                     * both header ("$") and body ("_") properties, then just reduce the responseBody value to
                     * the body ("_") property.
                     */
                    if (responseBody["$"] != undefined && responseBody["_"] != undefined) {
                        responseBody = responseBody["_"];
                    }
                }
                if (mapperType.match(/^Number$/ig) !== null) {
                    payload = parseFloat(responseBody);
                    if (isNaN(payload)) {
                        payload = responseBody;
                    }
                }
                else if (mapperType.match(/^Boolean$/ig) !== null) {
                    if (responseBody === "true") {
                        payload = true;
                    }
                    else if (responseBody === "false") {
                        payload = false;
                    }
                    else {
                        payload = responseBody;
                    }
                }
                else if (mapperType.match(/^(String|Enum|Object|Stream|Uuid|TimeSpan|any)$/ig) !== null) {
                    payload = responseBody;
                }
                else if (mapperType.match(/^(Date|DateTime|DateTimeRfc1123)$/ig) !== null) {
                    payload = new Date(responseBody);
                }
                else if (mapperType.match(/^UnixTime$/ig) !== null) {
                    payload = unixTimeToDate(responseBody);
                }
                else if (mapperType.match(/^ByteArray$/ig) !== null) {
                    payload = decodeString(responseBody);
                }
                else if (mapperType.match(/^Base64Url$/ig) !== null) {
                    payload = base64UrlToByteArray(responseBody);
                }
                else if (mapperType.match(/^Sequence$/ig) !== null) {
                    payload = deserializeSequenceType(this, mapper, responseBody, objectName);
                }
                else if (mapperType.match(/^Dictionary$/ig) !== null) {
                    payload = deserializeDictionaryType(this, mapper, responseBody, objectName);
                }
            }
            if (mapper.isConstant) {
                payload = mapper.defaultValue;
            }
            return payload;
        };
        return Serializer;
    }());
    function trimEnd(str, ch) {
        var len = str.length;
        while ((len - 1) >= 0 && str[len - 1] === ch) {
            --len;
        }
        return str.substr(0, len);
    }
    function bufferToBase64Url(buffer) {
        if (!buffer) {
            return undefined;
        }
        if (!(buffer instanceof Uint8Array)) {
            throw new Error("Please provide an input of type Uint8Array for converting to Base64Url.");
        }
        // Uint8Array to Base64.
        var str = encodeByteArray(buffer);
        // Base64 to Base64Url.
        return trimEnd(str, "=").replace(/\+/g, "-").replace(/\//g, "_");
    }
    function base64UrlToByteArray(str) {
        if (!str) {
            return undefined;
        }
        if (str && typeof str.valueOf() !== "string") {
            throw new Error("Please provide an input of type string for converting to Uint8Array");
        }
        // Base64Url to Base64.
        str = str.replace(/\-/g, "+").replace(/\_/g, "/");
        // Base64 to Uint8Array.
        return decodeString(str);
    }
    function splitSerializeName(prop) {
        var classes = [];
        var partialclass = "";
        if (prop) {
            var subwords = prop.split(".");
            for (var _i = 0, subwords_1 = subwords; _i < subwords_1.length; _i++) {
                var item = subwords_1[_i];
                if (item.charAt(item.length - 1) === "\\") {
                    partialclass += item.substr(0, item.length - 1) + ".";
                }
                else {
                    partialclass += item;
                    classes.push(partialclass);
                    partialclass = "";
                }
            }
        }
        return classes;
    }
    function dateToUnixTime(d) {
        if (!d) {
            return undefined;
        }
        if (typeof d.valueOf() === "string") {
            d = new Date(d);
        }
        return Math.floor(d.getTime() / 1000);
    }
    function unixTimeToDate(n) {
        if (!n) {
            return undefined;
        }
        return new Date(n * 1000);
    }
    function serializeBasicTypes(typeName, objectName, value) {
        if (value !== null && value !== undefined) {
            if (typeName.match(/^Number$/ig) !== null) {
                if (typeof value !== "number") {
                    throw new Error(objectName + " with value " + value + " must be of type number.");
                }
            }
            else if (typeName.match(/^String$/ig) !== null) {
                if (typeof value.valueOf() !== "string") {
                    throw new Error(objectName + " with value \"" + value + "\" must be of type string.");
                }
            }
            else if (typeName.match(/^Uuid$/ig) !== null) {
                if (!(typeof value.valueOf() === "string" && isValidUuid(value))) {
                    throw new Error(objectName + " with value \"" + value + "\" must be of type string and a valid uuid.");
                }
            }
            else if (typeName.match(/^Boolean$/ig) !== null) {
                if (typeof value !== "boolean") {
                    throw new Error(objectName + " with value " + value + " must be of type boolean.");
                }
            }
            else if (typeName.match(/^Stream$/ig) !== null) {
                var objectType = typeof value;
                if (objectType !== "string" &&
                    objectType !== "function" &&
                    !(value instanceof ArrayBuffer) &&
                    !ArrayBuffer.isView(value) &&
                    !(typeof Blob === "function" && value instanceof Blob)) {
                    throw new Error(objectName + " must be a string, Blob, ArrayBuffer, ArrayBufferView, or a function returning NodeJS.ReadableStream.");
                }
            }
        }
        return value;
    }
    function serializeEnumType(objectName, allowedValues, value) {
        if (!allowedValues) {
            throw new Error("Please provide a set of allowedValues to validate " + objectName + " as an Enum Type.");
        }
        var isPresent = allowedValues.some(function (item) {
            if (typeof item.valueOf() === "string") {
                return item.toLowerCase() === value.toLowerCase();
            }
            return item === value;
        });
        if (!isPresent) {
            throw new Error(value + " is not a valid value for " + objectName + ". The valid values are: " + JSON.stringify(allowedValues) + ".");
        }
        return value;
    }
    function serializeByteArrayType(objectName, value) {
        if (value != undefined) {
            if (!(value instanceof Uint8Array)) {
                throw new Error(objectName + " must be of type Uint8Array.");
            }
            value = encodeByteArray(value);
        }
        return value;
    }
    function serializeBase64UrlType(objectName, value) {
        if (value != undefined) {
            if (!(value instanceof Uint8Array)) {
                throw new Error(objectName + " must be of type Uint8Array.");
            }
            value = bufferToBase64Url(value);
        }
        return value;
    }
    function serializeDateTypes(typeName, value, objectName) {
        if (value != undefined) {
            if (typeName.match(/^Date$/ig) !== null) {
                if (!(value instanceof Date ||
                    (typeof value.valueOf() === "string" && !isNaN(Date.parse(value))))) {
                    throw new Error(objectName + " must be an instanceof Date or a string in ISO8601 format.");
                }
                value = (value instanceof Date) ? value.toISOString().substring(0, 10) : new Date(value).toISOString().substring(0, 10);
            }
            else if (typeName.match(/^DateTime$/ig) !== null) {
                if (!(value instanceof Date ||
                    (typeof value.valueOf() === "string" && !isNaN(Date.parse(value))))) {
                    throw new Error(objectName + " must be an instanceof Date or a string in ISO8601 format.");
                }
                value = (value instanceof Date) ? value.toISOString() : new Date(value).toISOString();
            }
            else if (typeName.match(/^DateTimeRfc1123$/ig) !== null) {
                if (!(value instanceof Date ||
                    (typeof value.valueOf() === "string" && !isNaN(Date.parse(value))))) {
                    throw new Error(objectName + " must be an instanceof Date or a string in RFC-1123 format.");
                }
                value = (value instanceof Date) ? value.toUTCString() : new Date(value).toUTCString();
            }
            else if (typeName.match(/^UnixTime$/ig) !== null) {
                if (!(value instanceof Date ||
                    (typeof value.valueOf() === "string" && !isNaN(Date.parse(value))))) {
                    throw new Error(objectName + " must be an instanceof Date or a string in RFC-1123/ISO8601 format " +
                        "for it to be serialized in UnixTime/Epoch format.");
                }
                value = dateToUnixTime(value);
            }
            else if (typeName.match(/^TimeSpan$/ig) !== null) {
                if (!isDuration(value)) {
                    throw new Error(objectName + " must be a string in ISO 8601 format. Instead was \"" + value + "\".");
                }
                value = value;
            }
        }
        return value;
    }
    function serializeSequenceType(serializer, mapper, object, objectName) {
        if (!Array.isArray(object)) {
            throw new Error(objectName + " must be of type Array.");
        }
        var elementType = mapper.type.element;
        if (!elementType || typeof elementType !== "object") {
            throw new Error("element\" metadata for an Array must be defined in the " +
                ("mapper and it must of type \"object\" in " + objectName + "."));
        }
        var tempArray = [];
        for (var i = 0; i < object.length; i++) {
            tempArray[i] = serializer.serialize(elementType, object[i], objectName);
        }
        return tempArray;
    }
    function serializeDictionaryType(serializer, mapper, object, objectName) {
        if (typeof object !== "object") {
            throw new Error(objectName + " must be of type object.");
        }
        var valueType = mapper.type.value;
        if (!valueType || typeof valueType !== "object") {
            throw new Error("\"value\" metadata for a Dictionary must be defined in the " +
                ("mapper and it must of type \"object\" in " + objectName + "."));
        }
        var tempDictionary = {};
        for (var _i = 0, _a = Object.keys(object); _i < _a.length; _i++) {
            var key = _a[_i];
            tempDictionary[key] = serializer.serialize(valueType, object[key], objectName + "." + key);
        }
        return tempDictionary;
    }
    /**
     * Resolves a composite mapper's modelProperties.
     * @param serializer the serializer containing the entire set of mappers
     * @param mapper the composite mapper to resolve
     */
    function resolveModelProperties(serializer, mapper, objectName) {
        var modelProps = mapper.type.modelProperties;
        if (!modelProps) {
            var className = mapper.type.className;
            if (!className) {
                throw new Error("Class name for model \"" + objectName + "\" is not provided in the mapper \"" + JSON.stringify(mapper, undefined, 2) + "\".");
            }
            var modelMapper = serializer.modelMappers[className];
            if (!modelMapper) {
                throw new Error("mapper() cannot be null or undefined for model \"" + className + "\".");
            }
            modelProps = modelMapper.type.modelProperties;
            if (!modelProps) {
                throw new Error("modelProperties cannot be null or undefined in the " +
                    ("mapper \"" + JSON.stringify(modelMapper) + "\" of type \"" + className + "\" for object \"" + objectName + "\"."));
            }
        }
        return modelProps;
    }
    function serializeCompositeType(serializer, mapper, object, objectName) {
        var _a;
        if (getPolymorphicDiscriminatorRecursively(serializer, mapper)) {
            mapper = getPolymorphicMapper(serializer, mapper, object, "clientName");
        }
        if (object != undefined) {
            var payload = {};
            var modelProps = resolveModelProperties(serializer, mapper, objectName);
            for (var _i = 0, _b = Object.keys(modelProps); _i < _b.length; _i++) {
                var key = _b[_i];
                var propertyMapper = modelProps[key];
                if (propertyMapper.readOnly) {
                    continue;
                }
                var propName = void 0;
                var parentObject = payload;
                if (serializer.isXML) {
                    if (propertyMapper.xmlIsWrapped) {
                        propName = propertyMapper.xmlName;
                    }
                    else {
                        propName = propertyMapper.xmlElementName || propertyMapper.xmlName;
                    }
                }
                else {
                    var paths = splitSerializeName(propertyMapper.serializedName);
                    propName = paths.pop();
                    for (var _c = 0, paths_1 = paths; _c < paths_1.length; _c++) {
                        var pathName = paths_1[_c];
                        var childObject = parentObject[pathName];
                        if ((childObject == undefined) && (object[key] != undefined)) {
                            parentObject[pathName] = {};
                        }
                        parentObject = parentObject[pathName];
                    }
                }
                if (parentObject != undefined) {
                    var propertyObjectName = propertyMapper.serializedName !== ""
                        ? objectName + "." + propertyMapper.serializedName
                        : objectName;
                    var toSerialize = object[key];
                    var polymorphicDiscriminator = getPolymorphicDiscriminatorRecursively(serializer, mapper);
                    if (polymorphicDiscriminator && polymorphicDiscriminator.clientName === key && toSerialize == undefined) {
                        toSerialize = mapper.serializedName;
                    }
                    var serializedValue = serializer.serialize(propertyMapper, toSerialize, propertyObjectName);
                    if (serializedValue !== undefined && propName != undefined) {
                        if (propertyMapper.xmlIsAttribute) {
                            // $ is the key attributes are kept under in xml2js.
                            // This keeps things simple while preventing name collision
                            // with names in user documents.
                            parentObject.$ = parentObject.$ || {};
                            parentObject.$[propName] = serializedValue;
                        }
                        else if (propertyMapper.xmlIsWrapped) {
                            parentObject[propName] = (_a = {}, _a[propertyMapper.xmlElementName] = serializedValue, _a);
                        }
                        else {
                            parentObject[propName] = serializedValue;
                        }
                    }
                }
            }
            var additionalPropertiesMapper = mapper.type.additionalProperties;
            if (additionalPropertiesMapper) {
                var propNames = Object.keys(modelProps);
                var _loop_1 = function (clientPropName) {
                    var isAdditionalProperty = propNames.every(function (pn) { return pn !== clientPropName; });
                    if (isAdditionalProperty) {
                        payload[clientPropName] = serializer.serialize(additionalPropertiesMapper, object[clientPropName], objectName + '["' + clientPropName + '"]');
                    }
                };
                for (var clientPropName in object) {
                    _loop_1(clientPropName);
                }
            }
            return payload;
        }
        return object;
    }
    function isSpecialXmlProperty(propertyName) {
        return ["$", "_"].includes(propertyName);
    }
    function deserializeCompositeType(serializer, mapper, responseBody, objectName) {
        if (getPolymorphicDiscriminatorRecursively(serializer, mapper)) {
            mapper = getPolymorphicMapper(serializer, mapper, responseBody, "serializedName");
        }
        var modelProps = resolveModelProperties(serializer, mapper, objectName);
        var instance = {};
        var handledPropertyNames = [];
        for (var _i = 0, _a = Object.keys(modelProps); _i < _a.length; _i++) {
            var key = _a[_i];
            var propertyMapper = modelProps[key];
            var paths = splitSerializeName(modelProps[key].serializedName);
            handledPropertyNames.push(paths[0]);
            var serializedName = propertyMapper.serializedName, xmlName = propertyMapper.xmlName, xmlElementName = propertyMapper.xmlElementName;
            var propertyObjectName = objectName;
            if (serializedName !== "" && serializedName !== undefined) {
                propertyObjectName = objectName + "." + serializedName;
            }
            var headerCollectionPrefix = propertyMapper.headerCollectionPrefix;
            if (headerCollectionPrefix) {
                var dictionary = {};
                for (var _b = 0, _c = Object.keys(responseBody); _b < _c.length; _b++) {
                    var headerKey = _c[_b];
                    if (headerKey.startsWith(headerCollectionPrefix)) {
                        dictionary[headerKey.substring(headerCollectionPrefix.length)] = serializer.deserialize(propertyMapper.type.value, responseBody[headerKey], propertyObjectName);
                    }
                    handledPropertyNames.push(headerKey);
                }
                instance[key] = dictionary;
            }
            else if (serializer.isXML) {
                if (propertyMapper.xmlIsAttribute && responseBody.$) {
                    instance[key] = serializer.deserialize(propertyMapper, responseBody.$[xmlName], propertyObjectName);
                }
                else {
                    var propertyName = xmlElementName || xmlName || serializedName;
                    var unwrappedProperty = responseBody[propertyName];
                    if (propertyMapper.xmlIsWrapped) {
                        unwrappedProperty = responseBody[xmlName];
                        unwrappedProperty = unwrappedProperty && unwrappedProperty[xmlElementName];
                        var isEmptyWrappedList = unwrappedProperty === undefined;
                        if (isEmptyWrappedList) {
                            unwrappedProperty = [];
                        }
                    }
                    instance[key] = serializer.deserialize(propertyMapper, unwrappedProperty, propertyObjectName);
                }
            }
            else {
                // deserialize the property if it is present in the provided responseBody instance
                var propertyInstance = void 0;
                var res = responseBody;
                // traversing the object step by step.
                for (var _d = 0, paths_2 = paths; _d < paths_2.length; _d++) {
                    var item = paths_2[_d];
                    if (!res)
                        break;
                    res = res[item];
                }
                propertyInstance = res;
                var polymorphicDiscriminator = mapper.type.polymorphicDiscriminator;
                if (polymorphicDiscriminator && propertyMapper.serializedName === polymorphicDiscriminator.serializedName && propertyInstance == undefined) {
                    propertyInstance = mapper.serializedName;
                }
                var serializedValue = void 0;
                // paging
                if (Array.isArray(responseBody[key]) && modelProps[key].serializedName === "") {
                    propertyInstance = responseBody[key];
                    instance = serializer.deserialize(propertyMapper, propertyInstance, propertyObjectName);
                }
                else if (propertyInstance !== undefined) {
                    serializedValue = serializer.deserialize(propertyMapper, propertyInstance, propertyObjectName);
                    instance[key] = serializedValue;
                }
            }
        }
        var additionalPropertiesMapper = mapper.type.additionalProperties;
        if (additionalPropertiesMapper) {
            var isAdditionalProperty = function (responsePropName) {
                for (var clientPropName in modelProps) {
                    var paths = splitSerializeName(modelProps[clientPropName].serializedName);
                    if (paths[0] === responsePropName) {
                        return false;
                    }
                }
                return true;
            };
            for (var responsePropName in responseBody) {
                if (isAdditionalProperty(responsePropName)) {
                    instance[responsePropName] = serializer.deserialize(additionalPropertiesMapper, responseBody[responsePropName], objectName + '["' + responsePropName + '"]');
                }
            }
        }
        else if (responseBody) {
            for (var _e = 0, _f = Object.keys(responseBody); _e < _f.length; _e++) {
                var key = _f[_e];
                if (instance[key] === undefined && !handledPropertyNames.includes(key) && !isSpecialXmlProperty(key)) {
                    instance[key] = responseBody[key];
                }
            }
        }
        return instance;
    }
    function deserializeDictionaryType(serializer, mapper, responseBody, objectName) {
        /*jshint validthis: true */
        var value = mapper.type.value;
        if (!value || typeof value !== "object") {
            throw new Error("\"value\" metadata for a Dictionary must be defined in the " +
                ("mapper and it must of type \"object\" in " + objectName));
        }
        if (responseBody) {
            var tempDictionary = {};
            for (var _i = 0, _a = Object.keys(responseBody); _i < _a.length; _i++) {
                var key = _a[_i];
                tempDictionary[key] = serializer.deserialize(value, responseBody[key], objectName);
            }
            return tempDictionary;
        }
        return responseBody;
    }
    function deserializeSequenceType(serializer, mapper, responseBody, objectName) {
        /*jshint validthis: true */
        var element = mapper.type.element;
        if (!element || typeof element !== "object") {
            throw new Error("element\" metadata for an Array must be defined in the " +
                ("mapper and it must of type \"object\" in " + objectName));
        }
        if (responseBody) {
            if (!Array.isArray(responseBody)) {
                // xml2js will interpret a single element array as just the element, so force it to be an array
                responseBody = [responseBody];
            }
            var tempArray = [];
            for (var i = 0; i < responseBody.length; i++) {
                tempArray[i] = serializer.deserialize(element, responseBody[i], objectName + "[" + i + "]");
            }
            return tempArray;
        }
        return responseBody;
    }
    function getPolymorphicMapper(serializer, mapper, object, polymorphicPropertyName) {
        var polymorphicDiscriminator = getPolymorphicDiscriminatorRecursively(serializer, mapper);
        if (polymorphicDiscriminator) {
            var discriminatorName = polymorphicDiscriminator[polymorphicPropertyName];
            if (discriminatorName != undefined) {
                var discriminatorValue = object[discriminatorName];
                if (discriminatorValue != undefined) {
                    var typeName = mapper.type.uberParent || mapper.type.className;
                    var indexDiscriminator = discriminatorValue === typeName
                        ? discriminatorValue
                        : typeName + "." + discriminatorValue;
                    var polymorphicMapper = serializer.modelMappers.discriminators[indexDiscriminator];
                    if (polymorphicMapper) {
                        mapper = polymorphicMapper;
                    }
                }
            }
        }
        return mapper;
    }
    function getPolymorphicDiscriminatorRecursively(serializer, mapper) {
        return mapper.type.polymorphicDiscriminator
            || getPolymorphicDiscriminatorSafely(serializer, mapper.type.uberParent)
            || getPolymorphicDiscriminatorSafely(serializer, mapper.type.className);
    }
    function getPolymorphicDiscriminatorSafely(serializer, typeName) {
        return (typeName && serializer.modelMappers[typeName] && serializer.modelMappers[typeName].type.polymorphicDiscriminator);
    }
    /**
     * Utility function to create a K:V from a list of strings
     */
    function strEnum(o) {
        var result = {};
        for (var _i = 0, o_1 = o; _i < o_1.length; _i++) {
            var key = o_1[_i];
            result[key] = key;
        }
        return result;
    }
    var MapperType = strEnum([
        "Base64Url",
        "Boolean",
        "ByteArray",
        "Composite",
        "Date",
        "DateTime",
        "DateTimeRfc1123",
        "Dictionary",
        "Enum",
        "Number",
        "Object",
        "Sequence",
        "String",
        "Stream",
        "TimeSpan",
        "UnixTime"
    ]);

    // Copyright (c) Microsoft Corporation. All rights reserved.
    /**
     * Creates a new WebResource object.
     *
     * This class provides an abstraction over a REST call by being library / implementation agnostic and wrapping the necessary
     * properties to initiate a request.
     *
     * @constructor
     */
    var WebResource = /** @class */ (function () {
        function WebResource(url, method, body, query, headers, streamResponseBody, withCredentials, abortSignal, timeout, onUploadProgress, onDownloadProgress, proxySettings) {
            this.streamResponseBody = streamResponseBody;
            this.url = url || "";
            this.method = method || "GET";
            this.headers = (headers instanceof HttpHeaders ? headers : new HttpHeaders(headers));
            this.body = body;
            this.query = query;
            this.formData = undefined;
            this.withCredentials = withCredentials || false;
            this.abortSignal = abortSignal;
            this.timeout = timeout || 0;
            this.onUploadProgress = onUploadProgress;
            this.onDownloadProgress = onDownloadProgress;
            this.proxySettings = proxySettings;
        }
        /**
         * Validates that the required properties such as method, url, headers["Content-Type"],
         * headers["accept-language"] are defined. It will throw an error if one of the above
         * mentioned properties are not defined.
         */
        WebResource.prototype.validateRequestProperties = function () {
            if (!this.method) {
                throw new Error("WebResource.method is required.");
            }
            if (!this.url) {
                throw new Error("WebResource.url is required.");
            }
        };
        /**
         * Prepares the request.
         * @param {RequestPrepareOptions} options Options to provide for preparing the request.
         * @returns {WebResource} Returns the prepared WebResource (HTTP Request) object that needs to be given to the request pipeline.
         */
        WebResource.prototype.prepare = function (options) {
            if (!options) {
                throw new Error("options object is required");
            }
            if (options.method == undefined || typeof options.method.valueOf() !== "string") {
                throw new Error("options.method must be a string.");
            }
            if (options.url && options.pathTemplate) {
                throw new Error("options.url and options.pathTemplate are mutually exclusive. Please provide exactly one of them.");
            }
            if ((options.pathTemplate == undefined || typeof options.pathTemplate.valueOf() !== "string") && (options.url == undefined || typeof options.url.valueOf() !== "string")) {
                throw new Error("Please provide exactly one of options.pathTemplate or options.url.");
            }
            // set the url if it is provided.
            if (options.url) {
                if (typeof options.url !== "string") {
                    throw new Error("options.url must be of type \"string\".");
                }
                this.url = options.url;
            }
            // set the method
            if (options.method) {
                var validMethods = ["GET", "PUT", "HEAD", "DELETE", "OPTIONS", "POST", "PATCH", "TRACE"];
                if (validMethods.indexOf(options.method.toUpperCase()) === -1) {
                    throw new Error("The provided method \"" + options.method + "\" is invalid. Supported HTTP methods are: " + JSON.stringify(validMethods));
                }
            }
            this.method = options.method.toUpperCase();
            // construct the url if path template is provided
            if (options.pathTemplate) {
                var pathTemplate_1 = options.pathTemplate, pathParameters_1 = options.pathParameters;
                if (typeof pathTemplate_1 !== "string") {
                    throw new Error("options.pathTemplate must be of type \"string\".");
                }
                if (!options.baseUrl) {
                    options.baseUrl = "https://management.azure.com";
                }
                var baseUrl = options.baseUrl;
                var url_1 = baseUrl + (baseUrl.endsWith("/") ? "" : "/") + (pathTemplate_1.startsWith("/") ? pathTemplate_1.slice(1) : pathTemplate_1);
                var segments = url_1.match(/({\w*\s*\w*})/ig);
                if (segments && segments.length) {
                    if (!pathParameters_1) {
                        throw new Error("pathTemplate: " + pathTemplate_1 + " has been provided. Hence, options.pathParameters must also be provided.");
                    }
                    segments.forEach(function (item) {
                        var pathParamName = item.slice(1, -1);
                        var pathParam = pathParameters_1[pathParamName];
                        if (pathParam === null || pathParam === undefined || !(typeof pathParam === "string" || typeof pathParam === "object")) {
                            throw new Error("pathTemplate: " + pathTemplate_1 + " contains the path parameter " + pathParamName +
                                (" however, it is not present in " + pathParameters_1 + " - " + JSON.stringify(pathParameters_1, undefined, 2) + ".") +
                                ("The value of the path parameter can either be a \"string\" of the form { " + pathParamName + ": \"some sample value\" } or ") +
                                ("it can be an \"object\" of the form { \"" + pathParamName + "\": { value: \"some sample value\", skipUrlEncoding: true } }."));
                        }
                        if (typeof pathParam.valueOf() === "string") {
                            url_1 = url_1.replace(item, encodeURIComponent(pathParam));
                        }
                        if (typeof pathParam.valueOf() === "object") {
                            if (!pathParam.value) {
                                throw new Error("options.pathParameters[" + pathParamName + "] is of type \"object\" but it does not contain a \"value\" property.");
                            }
                            if (pathParam.skipUrlEncoding) {
                                url_1 = url_1.replace(item, pathParam.value);
                            }
                            else {
                                url_1 = url_1.replace(item, encodeURIComponent(pathParam.value));
                            }
                        }
                    });
                }
                this.url = url_1;
            }
            // append query parameters to the url if they are provided. They can be provided with pathTemplate or url option.
            if (options.queryParameters) {
                var queryParameters = options.queryParameters;
                if (typeof queryParameters !== "object") {
                    throw new Error("options.queryParameters must be of type object. It should be a JSON object " +
                        "of \"query-parameter-name\" as the key and the \"query-parameter-value\" as the value. " +
                        "The \"query-parameter-value\" may be fo type \"string\" or an \"object\" of the form { value: \"query-parameter-value\", skipUrlEncoding: true }.");
                }
                // append question mark if it is not present in the url
                if (this.url && this.url.indexOf("?") === -1) {
                    this.url += "?";
                }
                // construct queryString
                var queryParams = [];
                // We need to populate this.query as a dictionary if the request is being used for Sway's validateRequest().
                this.query = {};
                for (var queryParamName in queryParameters) {
                    var queryParam = queryParameters[queryParamName];
                    if (queryParam) {
                        if (typeof queryParam === "string") {
                            queryParams.push(queryParamName + "=" + encodeURIComponent(queryParam));
                            this.query[queryParamName] = encodeURIComponent(queryParam);
                        }
                        else if (typeof queryParam === "object") {
                            if (!queryParam.value) {
                                throw new Error("options.queryParameters[" + queryParamName + "] is of type \"object\" but it does not contain a \"value\" property.");
                            }
                            if (queryParam.skipUrlEncoding) {
                                queryParams.push(queryParamName + "=" + queryParam.value);
                                this.query[queryParamName] = queryParam.value;
                            }
                            else {
                                queryParams.push(queryParamName + "=" + encodeURIComponent(queryParam.value));
                                this.query[queryParamName] = encodeURIComponent(queryParam.value);
                            }
                        }
                    }
                } // end-of-for
                // append the queryString
                this.url += queryParams.join("&");
            }
            // add headers to the request if they are provided
            if (options.headers) {
                var headers = options.headers;
                for (var _i = 0, _a = Object.keys(options.headers); _i < _a.length; _i++) {
                    var headerName = _a[_i];
                    this.headers.set(headerName, headers[headerName]);
                }
            }
            // ensure accept-language is set correctly
            if (!this.headers.get("accept-language")) {
                this.headers.set("accept-language", "en-US");
            }
            // ensure the request-id is set correctly
            if (!this.headers.get("x-ms-client-request-id") && !options.disableClientRequestId) {
                this.headers.set("x-ms-client-request-id", generateUuid());
            }
            // default
            if (!this.headers.get("Content-Type")) {
                this.headers.set("Content-Type", "application/json; charset=utf-8");
            }
            // set the request body. request.js automatically sets the Content-Length request header, so we need not set it explicilty
            this.body = options.body;
            if (options.body != undefined) {
                // body as a stream special case. set the body as-is and check for some special request headers specific to sending a stream.
                if (options.bodyIsStream) {
                    if (!this.headers.get("Transfer-Encoding")) {
                        this.headers.set("Transfer-Encoding", "chunked");
                    }
                    if (this.headers.get("Content-Type") !== "application/octet-stream") {
                        this.headers.set("Content-Type", "application/octet-stream");
                    }
                }
                else {
                    if (options.serializationMapper) {
                        this.body = new Serializer(options.mappers).serialize(options.serializationMapper, options.body, "requestBody");
                    }
                    if (!options.disableJsonStringifyOnBody) {
                        this.body = JSON.stringify(options.body);
                    }
                }
            }
            this.abortSignal = options.abortSignal;
            this.onDownloadProgress = options.onDownloadProgress;
            this.onUploadProgress = options.onUploadProgress;
            return this;
        };
        /**
         * Clone this WebResource HTTP request object.
         * @returns {WebResource} The clone of this WebResource HTTP request object.
         */
        WebResource.prototype.clone = function () {
            var result = new WebResource(this.url, this.method, this.body, this.query, this.headers && this.headers.clone(), this.streamResponseBody, this.withCredentials, this.abortSignal, this.timeout, this.onUploadProgress, this.onDownloadProgress);
            if (this.formData) {
                result.formData = this.formData;
            }
            if (this.operationSpec) {
                result.operationSpec = this.operationSpec;
            }
            if (this.shouldDeserialize) {
                result.shouldDeserialize = this.shouldDeserialize;
            }
            if (this.operationResponseGetter) {
                result.operationResponseGetter = this.operationResponseGetter;
            }
            return result;
        };
        return WebResource;
    }());

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __awaiter(thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    // Copyright (c) Microsoft Corporation. All rights reserved.
    var RestError = /** @class */ (function (_super) {
        __extends(RestError, _super);
        function RestError(message, code, statusCode, request, response, body) {
            var _this = _super.call(this, message) || this;
            _this.code = code;
            _this.statusCode = statusCode;
            _this.request = request;
            _this.response = response;
            _this.body = body;
            Object.setPrototypeOf(_this, RestError.prototype);
            return _this;
        }
        RestError.REQUEST_SEND_ERROR = "REQUEST_SEND_ERROR";
        RestError.REQUEST_ABORTED_ERROR = "REQUEST_ABORTED_ERROR";
        RestError.PARSE_ERROR = "PARSE_ERROR";
        return RestError;
    }(Error));

    // Copyright (c) Microsoft Corporation. All rights reserved.
    /**
     * A HttpClient implementation that uses XMLHttpRequest to send HTTP requests.
     */
    var XhrHttpClient = /** @class */ (function () {
        function XhrHttpClient() {
        }
        XhrHttpClient.prototype.sendRequest = function (request) {
            var xhr = new XMLHttpRequest();
            if (request.proxySettings) {
                throw new Error("HTTP proxy is not supported in browser environment");
            }
            var abortSignal = request.abortSignal;
            if (abortSignal) {
                var listener_1 = function () {
                    xhr.abort();
                };
                abortSignal.addEventListener("abort", listener_1);
                xhr.addEventListener("readystatechange", function () {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        abortSignal.removeEventListener("abort", listener_1);
                    }
                });
            }
            addProgressListener(xhr.upload, request.onUploadProgress);
            addProgressListener(xhr, request.onDownloadProgress);
            if (request.formData) {
                var formData = request.formData;
                var requestForm_1 = new FormData();
                var appendFormValue = function (key, value) {
                    if (value && value.hasOwnProperty("value") && value.hasOwnProperty("options")) {
                        requestForm_1.append(key, value.value, value.options);
                    }
                    else {
                        requestForm_1.append(key, value);
                    }
                };
                for (var _i = 0, _a = Object.keys(formData); _i < _a.length; _i++) {
                    var formKey = _a[_i];
                    var formValue = formData[formKey];
                    if (Array.isArray(formValue)) {
                        for (var j = 0; j < formValue.length; j++) {
                            appendFormValue(formKey, formValue[j]);
                        }
                    }
                    else {
                        appendFormValue(formKey, formValue);
                    }
                }
                request.body = requestForm_1;
                request.formData = undefined;
                var contentType = request.headers.get("Content-Type");
                if (contentType && contentType.indexOf("multipart/form-data") !== -1) {
                    // browser will automatically apply a suitable content-type header
                    request.headers.remove("Content-Type");
                }
            }
            xhr.open(request.method, request.url);
            xhr.timeout = request.timeout;
            xhr.withCredentials = request.withCredentials;
            for (var _b = 0, _c = request.headers.headersArray(); _b < _c.length; _b++) {
                var header = _c[_b];
                xhr.setRequestHeader(header.name, header.value);
            }
            xhr.responseType = request.streamResponseBody ? "blob" : "text";
            // tslint:disable-next-line:no-null-keyword
            xhr.send(request.body === undefined ? null : request.body);
            if (request.streamResponseBody) {
                return new Promise(function (resolve, reject) {
                    xhr.addEventListener("readystatechange", function () {
                        // Resolve as soon as headers are loaded
                        if (xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
                            var blobBody = new Promise(function (resolve, reject) {
                                xhr.addEventListener("load", function () {
                                    resolve(xhr.response);
                                });
                                rejectOnTerminalEvent(request, xhr, reject);
                            });
                            resolve({
                                request: request,
                                status: xhr.status,
                                headers: parseHeaders(xhr),
                                blobBody: blobBody
                            });
                        }
                    });
                    rejectOnTerminalEvent(request, xhr, reject);
                });
            }
            else {
                return new Promise(function (resolve, reject) {
                    xhr.addEventListener("load", function () { return resolve({
                        request: request,
                        status: xhr.status,
                        headers: parseHeaders(xhr),
                        bodyAsText: xhr.responseText
                    }); });
                    rejectOnTerminalEvent(request, xhr, reject);
                });
            }
        };
        return XhrHttpClient;
    }());
    function addProgressListener(xhr, listener) {
        if (listener) {
            xhr.addEventListener("progress", function (rawEvent) { return listener({
                loadedBytes: rawEvent.loaded
            }); });
        }
    }
    // exported locally for testing
    function parseHeaders(xhr) {
        var responseHeaders = new HttpHeaders();
        var headerLines = xhr.getAllResponseHeaders().trim().split(/[\r\n]+/);
        for (var _i = 0, headerLines_1 = headerLines; _i < headerLines_1.length; _i++) {
            var line = headerLines_1[_i];
            var index = line.indexOf(":");
            var headerName = line.slice(0, index);
            var headerValue = line.slice(index + 2);
            responseHeaders.set(headerName, headerValue);
        }
        return responseHeaders;
    }
    function rejectOnTerminalEvent(request, xhr, reject) {
        xhr.addEventListener("error", function () { return reject(new RestError("Failed to send request to " + request.url, RestError.REQUEST_SEND_ERROR, undefined, request)); });
        xhr.addEventListener("abort", function () { return reject(new RestError("The request was aborted", RestError.REQUEST_ABORTED_ERROR, undefined, request)); });
        xhr.addEventListener("timeout", function () { return reject(new RestError("timeout of " + xhr.timeout + "ms exceeded", RestError.REQUEST_SEND_ERROR, undefined, request)); });
    }

    // Copyright (c) Microsoft Corporation. All rights reserved.
    (function (HttpPipelineLogLevel) {
        /**
         * A log level that indicates that no logs will be logged.
         */
        HttpPipelineLogLevel[HttpPipelineLogLevel["OFF"] = 0] = "OFF";
        /**
         * An error log.
         */
        HttpPipelineLogLevel[HttpPipelineLogLevel["ERROR"] = 1] = "ERROR";
        /**
         * A warning log.
         */
        HttpPipelineLogLevel[HttpPipelineLogLevel["WARNING"] = 2] = "WARNING";
        /**
         * An information log.
         */
        HttpPipelineLogLevel[HttpPipelineLogLevel["INFO"] = 3] = "INFO";
    })(exports.HttpPipelineLogLevel || (exports.HttpPipelineLogLevel = {}));

    // Copyright (c) Microsoft Corporation. All rights reserved.
    // Licensed under the MIT License. See License.txt in the project root for license information.
    /**
     * Get the path to this parameter's value as a dotted string (a.b.c).
     * @param parameter The parameter to get the path string for.
     * @returns The path to this parameter's value as a dotted string.
     */
    function getPathStringFromParameter(parameter) {
        return getPathStringFromParameterPath(parameter.parameterPath, parameter.mapper);
    }
    function getPathStringFromParameterPath(parameterPath, mapper) {
        var result;
        if (typeof parameterPath === "string") {
            result = parameterPath;
        }
        else if (Array.isArray(parameterPath)) {
            result = parameterPath.join(".");
        }
        else {
            result = mapper.serializedName;
        }
        return result;
    }

    // Copyright (c) Microsoft Corporation. All rights reserved.
    function isStreamOperation(operationSpec) {
        var result = false;
        for (var statusCode in operationSpec.responses) {
            var operationResponse = operationSpec.responses[statusCode];
            if (operationResponse.bodyMapper && operationResponse.bodyMapper.type.name === MapperType.Stream) {
                result = true;
                break;
            }
        }
        return result;
    }

    // Copyright (c) Microsoft Corporation. All rights reserved.
    // Licensed under the MIT License. See License.txt in the project root for license information.
    var parser = new DOMParser();
    function parseXML(str) {
        try {
            var dom = parser.parseFromString(str, "application/xml");
            throwIfError(dom);
            var obj = domToObject(dom.childNodes[0]);
            return Promise.resolve(obj);
        }
        catch (err) {
            return Promise.reject(err);
        }
    }
    var errorNS = "";
    try {
        errorNS = parser.parseFromString("INVALID", "text/xml").getElementsByTagName("parsererror")[0].namespaceURI;
    }
    catch (ignored) {
        // Most browsers will return a document containing <parsererror>, but IE will throw.
    }
    function throwIfError(dom) {
        if (errorNS) {
            var parserErrors = dom.getElementsByTagNameNS(errorNS, "parsererror");
            if (parserErrors.length) {
                throw new Error(parserErrors.item(0).innerHTML);
            }
        }
    }
    function isElement(node) {
        return !!node.attributes;
    }
    /**
     * Get the Element-typed version of the provided Node if the provided node is an element with
     * attributes. If it isn't, then undefined is returned.
     */
    function asElementWithAttributes(node) {
        return isElement(node) && node.hasAttributes() ? node : undefined;
    }
    function domToObject(node) {
        var result = {};
        var childNodeCount = node.childNodes.length;
        var firstChildNode = node.childNodes[0];
        var onlyChildTextValue = (firstChildNode && childNodeCount === 1 && firstChildNode.nodeType === Node.TEXT_NODE && firstChildNode.nodeValue) || undefined;
        var elementWithAttributes = asElementWithAttributes(node);
        if (elementWithAttributes) {
            result["$"] = {};
            for (var i = 0; i < elementWithAttributes.attributes.length; i++) {
                var attr = elementWithAttributes.attributes[i];
                result["$"][attr.nodeName] = attr.nodeValue;
            }
            if (onlyChildTextValue) {
                result["_"] = onlyChildTextValue;
            }
        }
        else if (childNodeCount === 0) {
            result = "";
        }
        else if (onlyChildTextValue) {
            result = onlyChildTextValue;
        }
        if (!onlyChildTextValue) {
            for (var i = 0; i < childNodeCount; i++) {
                var child = node.childNodes[i];
                // Ignore leading/trailing whitespace nodes
                if (child.nodeType !== Node.TEXT_NODE) {
                    var childObject = domToObject(child);
                    if (!result[child.nodeName]) {
                        result[child.nodeName] = childObject;
                    }
                    else if (Array.isArray(result[child.nodeName])) {
                        result[child.nodeName].push(childObject);
                    }
                    else {
                        result[child.nodeName] = [result[child.nodeName], childObject];
                    }
                }
            }
        }
        return result;
    }
    // tslint:disable-next-line:no-null-keyword
    var doc = document.implementation.createDocument(null, null, null);
    var serializer = new XMLSerializer();
    function stringifyXML(obj, opts) {
        var rootName = opts && opts.rootName || "root";
        var dom = buildNode(obj, rootName)[0];
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + serializer.serializeToString(dom);
    }
    function buildAttributes(attrs) {
        var result = [];
        for (var _i = 0, _a = Object.keys(attrs); _i < _a.length; _i++) {
            var key = _a[_i];
            var attr = doc.createAttribute(key);
            attr.value = attrs[key].toString();
            result.push(attr);
        }
        return result;
    }
    function buildNode(obj, elementName) {
        if (typeof obj === "string" || typeof obj === "number" || typeof obj === "boolean") {
            var elem = doc.createElement(elementName);
            elem.textContent = obj.toString();
            return [elem];
        }
        else if (Array.isArray(obj)) {
            var result = [];
            for (var _i = 0, obj_1 = obj; _i < obj_1.length; _i++) {
                var arrayElem = obj_1[_i];
                for (var _a = 0, _b = buildNode(arrayElem, elementName); _a < _b.length; _a++) {
                    var child = _b[_a];
                    result.push(child);
                }
            }
            return result;
        }
        else if (typeof obj === "object") {
            var elem = doc.createElement(elementName);
            for (var _c = 0, _d = Object.keys(obj); _c < _d.length; _c++) {
                var key = _d[_c];
                if (key === "$") {
                    for (var _e = 0, _f = buildAttributes(obj[key]); _e < _f.length; _e++) {
                        var attr = _f[_e];
                        elem.attributes.setNamedItem(attr);
                    }
                }
                else {
                    for (var _g = 0, _h = buildNode(obj[key], key); _g < _h.length; _g++) {
                        var child = _h[_g];
                        elem.appendChild(child);
                    }
                }
            }
            return [elem];
        }
        else {
            throw new Error("Illegal value passed to buildObject: " + obj);
        }
    }

    // Copyright (c) Microsoft Corporation. All rights reserved.
    var BaseRequestPolicy = /** @class */ (function () {
        function BaseRequestPolicy(_nextPolicy, _options) {
            this._nextPolicy = _nextPolicy;
            this._options = _options;
        }
        /**
         * Get whether or not a log with the provided log level should be logged.
         * @param logLevel The log level of the log that will be logged.
         * @returns Whether or not a log with the provided log level should be logged.
         */
        BaseRequestPolicy.prototype.shouldLog = function (logLevel) {
            return this._options.shouldLog(logLevel);
        };
        /**
         * Attempt to log the provided message to the provided logger. If no logger was provided or if
         * the log level does not meat the logger's threshold, then nothing will be logged.
         * @param logLevel The log level of this log.
         * @param message The message of this log.
         */
        BaseRequestPolicy.prototype.log = function (logLevel, message) {
            this._options.log(logLevel, message);
        };
        return BaseRequestPolicy;
    }());
    /**
     * Optional properties that can be used when creating a RequestPolicy.
     */
    var RequestPolicyOptions = /** @class */ (function () {
        function RequestPolicyOptions(_logger) {
            this._logger = _logger;
        }
        /**
         * Get whether or not a log with the provided log level should be logged.
         * @param logLevel The log level of the log that will be logged.
         * @returns Whether or not a log with the provided log level should be logged.
         */
        RequestPolicyOptions.prototype.shouldLog = function (logLevel) {
            return !!this._logger &&
                logLevel !== exports.HttpPipelineLogLevel.OFF &&
                logLevel <= this._logger.minimumLogLevel;
        };
        /**
         * Attempt to log the provided message to the provided logger. If no logger was provided or if
         * the log level does not meat the logger's threshold, then nothing will be logged.
         * @param logLevel The log level of this log.
         * @param message The message of this log.
         */
        RequestPolicyOptions.prototype.log = function (logLevel, message) {
            if (this._logger && this.shouldLog(logLevel)) {
                this._logger.log(logLevel, message);
            }
        };
        return RequestPolicyOptions;
    }());

    // Copyright (c) Microsoft Corporation. All rights reserved.
    /**
     * Create a new serialization RequestPolicyCreator that will serialized HTTP request bodies as they
     * pass through the HTTP pipeline.
     */
    function deserializationPolicy(deserializationContentTypes) {
        return {
            create: function (nextPolicy, options) {
                return new DeserializationPolicy(nextPolicy, deserializationContentTypes, options);
            }
        };
    }
    var defaultJsonContentTypes = ["application/json", "text/json"];
    var defaultXmlContentTypes = ["application/xml", "application/atom+xml"];
    /**
     * A RequestPolicy that will deserialize HTTP response bodies and headers as they pass through the
     * HTTP pipeline.
     */
    var DeserializationPolicy = /** @class */ (function (_super) {
        __extends(DeserializationPolicy, _super);
        function DeserializationPolicy(nextPolicy, deserializationContentTypes, options) {
            var _this = _super.call(this, nextPolicy, options) || this;
            _this.jsonContentTypes = deserializationContentTypes && deserializationContentTypes.json || defaultJsonContentTypes;
            _this.xmlContentTypes = deserializationContentTypes && deserializationContentTypes.xml || defaultXmlContentTypes;
            return _this;
        }
        DeserializationPolicy.prototype.sendRequest = function (request) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2 /*return*/, this._nextPolicy.sendRequest(request).then(function (response) { return deserializeResponseBody(_this.jsonContentTypes, _this.xmlContentTypes, response); })];
                });
            });
        };
        return DeserializationPolicy;
    }(BaseRequestPolicy));
    function getOperationResponse(parsedResponse) {
        var result;
        var request = parsedResponse.request;
        var operationSpec = request.operationSpec;
        if (operationSpec) {
            var operationResponseGetter = request.operationResponseGetter;
            if (!operationResponseGetter) {
                result = operationSpec.responses[parsedResponse.status];
            }
            else {
                result = operationResponseGetter(operationSpec, parsedResponse);
            }
        }
        return result;
    }
    function shouldDeserializeResponse(parsedResponse) {
        var shouldDeserialize = parsedResponse.request.shouldDeserialize;
        var result;
        if (shouldDeserialize === undefined) {
            result = true;
        }
        else if (typeof shouldDeserialize === "boolean") {
            result = shouldDeserialize;
        }
        else {
            result = shouldDeserialize(parsedResponse);
        }
        return result;
    }
    function deserializeResponseBody(jsonContentTypes, xmlContentTypes, response) {
        return parse(jsonContentTypes, xmlContentTypes, response).then(function (parsedResponse) {
            var shouldDeserialize = shouldDeserializeResponse(parsedResponse);
            if (shouldDeserialize) {
                var operationSpec = parsedResponse.request.operationSpec;
                if (operationSpec && operationSpec.responses) {
                    var statusCode = parsedResponse.status;
                    var expectedStatusCodes = Object.keys(operationSpec.responses);
                    var hasNoExpectedStatusCodes = (expectedStatusCodes.length === 0 || (expectedStatusCodes.length === 1 && expectedStatusCodes[0] === "default"));
                    var responseSpec = getOperationResponse(parsedResponse);
                    var isExpectedStatusCode = hasNoExpectedStatusCodes ? (200 <= statusCode && statusCode < 300) : !!responseSpec;
                    if (!isExpectedStatusCode) {
                        var defaultResponseSpec = operationSpec.responses.default;
                        if (defaultResponseSpec) {
                            var initialErrorMessage = isStreamOperation(operationSpec)
                                ? "Unexpected status code: " + statusCode
                                : parsedResponse.bodyAsText;
                            var error = new RestError(initialErrorMessage);
                            error.statusCode = statusCode;
                            error.request = stripRequest(parsedResponse.request);
                            error.response = stripResponse(parsedResponse);
                            var parsedErrorResponse = parsedResponse.parsedBody;
                            try {
                                if (parsedErrorResponse) {
                                    var defaultResponseBodyMapper = defaultResponseSpec.bodyMapper;
                                    if (defaultResponseBodyMapper && defaultResponseBodyMapper.serializedName === "CloudError") {
                                        if (parsedErrorResponse.error) {
                                            parsedErrorResponse = parsedErrorResponse.error;
                                        }
                                        if (parsedErrorResponse.code) {
                                            error.code = parsedErrorResponse.code;
                                        }
                                        if (parsedErrorResponse.message) {
                                            error.message = parsedErrorResponse.message;
                                        }
                                    }
                                    else {
                                        var internalError = parsedErrorResponse;
                                        if (parsedErrorResponse.error) {
                                            internalError = parsedErrorResponse.error;
                                        }
                                        error.code = internalError.code;
                                        if (internalError.message) {
                                            error.message = internalError.message;
                                        }
                                    }
                                    if (defaultResponseBodyMapper) {
                                        var valueToDeserialize = parsedErrorResponse;
                                        if (operationSpec.isXML && defaultResponseBodyMapper.type.name === MapperType.Sequence) {
                                            valueToDeserialize = typeof parsedErrorResponse === "object"
                                                ? parsedErrorResponse[defaultResponseBodyMapper.xmlElementName]
                                                : [];
                                        }
                                        error.body = operationSpec.serializer.deserialize(defaultResponseBodyMapper, valueToDeserialize, "error.body");
                                    }
                                }
                            }
                            catch (defaultError) {
                                error.message = "Error \"" + defaultError.message + "\" occurred in deserializing the responseBody - \"" + parsedResponse.bodyAsText + "\" for the default response.";
                            }
                            return Promise.reject(error);
                        }
                    }
                    else if (responseSpec) {
                        if (responseSpec.bodyMapper) {
                            var valueToDeserialize = parsedResponse.parsedBody;
                            if (operationSpec.isXML && responseSpec.bodyMapper.type.name === MapperType.Sequence) {
                                valueToDeserialize = typeof valueToDeserialize === "object" ? valueToDeserialize[responseSpec.bodyMapper.xmlElementName] : [];
                            }
                            try {
                                parsedResponse.parsedBody = operationSpec.serializer.deserialize(responseSpec.bodyMapper, valueToDeserialize, "operationRes.parsedBody");
                            }
                            catch (error) {
                                var restError = new RestError("Error " + error + " occurred in deserializing the responseBody - " + parsedResponse.bodyAsText);
                                restError.request = stripRequest(parsedResponse.request);
                                restError.response = stripResponse(parsedResponse);
                                return Promise.reject(restError);
                            }
                        }
                        else if (operationSpec.httpMethod === "HEAD") {
                            // head methods never have a body, but we return a boolean to indicate presence/absence of the resource
                            parsedResponse.parsedBody = response.status >= 200 && response.status < 300;
                        }
                        if (responseSpec.headersMapper) {
                            parsedResponse.parsedHeaders = operationSpec.serializer.deserialize(responseSpec.headersMapper, parsedResponse.headers.rawHeaders(), "operationRes.parsedHeaders");
                        }
                    }
                }
            }
            return Promise.resolve(parsedResponse);
        });
    }
    function parse(jsonContentTypes, xmlContentTypes, operationResponse) {
        var errorHandler = function (err) {
            var msg = "Error \"" + err + "\" occurred while parsing the response body - " + operationResponse.bodyAsText + ".";
            var errCode = err.code || RestError.PARSE_ERROR;
            var e = new RestError(msg, errCode, operationResponse.status, operationResponse.request, operationResponse, operationResponse.bodyAsText);
            return Promise.reject(e);
        };
        if (!operationResponse.request.streamResponseBody && operationResponse.bodyAsText) {
            var text_1 = operationResponse.bodyAsText;
            var contentType = operationResponse.headers.get("Content-Type") || "";
            var contentComponents = !contentType ? [] : contentType.split(";").map(function (component) { return component.toLowerCase(); });
            if (contentComponents.length === 0 || contentComponents.some(function (component) { return jsonContentTypes.indexOf(component) !== -1; })) {
                return new Promise(function (resolve) {
                    operationResponse.parsedBody = JSON.parse(text_1);
                    resolve(operationResponse);
                }).catch(errorHandler);
            }
            else if (contentComponents.some(function (component) { return xmlContentTypes.indexOf(component) !== -1; })) {
                return parseXML(text_1)
                    .then(function (body) {
                    operationResponse.parsedBody = body;
                    return operationResponse;
                })
                    .catch(errorHandler);
            }
        }
        return Promise.resolve(operationResponse);
    }

    // Copyright (c) Microsoft Corporation. All rights reserved.
    function exponentialRetryPolicy(retryCount, retryInterval, minRetryInterval, maxRetryInterval) {
        return {
            create: function (nextPolicy, options) {
                return new ExponentialRetryPolicy(nextPolicy, options, retryCount, retryInterval, minRetryInterval, maxRetryInterval);
            }
        };
    }
    var DEFAULT_CLIENT_RETRY_INTERVAL = 1000 * 30;
    var DEFAULT_CLIENT_RETRY_COUNT = 3;
    var DEFAULT_CLIENT_MAX_RETRY_INTERVAL = 1000 * 90;
    var DEFAULT_CLIENT_MIN_RETRY_INTERVAL = 1000 * 3;
    /**
     * @class
     * Instantiates a new "ExponentialRetryPolicyFilter" instance.
     */
    var ExponentialRetryPolicy = /** @class */ (function (_super) {
        __extends(ExponentialRetryPolicy, _super);
        /**
         * @constructor
         * @param {RequestPolicy} nextPolicy The next RequestPolicy in the pipeline chain.
         * @param {RequestPolicyOptions} options The options for this RequestPolicy.
         * @param {number} [retryCount]        The client retry count.
         * @param {number} [retryInterval]     The client retry interval, in milliseconds.
         * @param {number} [minRetryInterval]  The minimum retry interval, in milliseconds.
         * @param {number} [maxRetryInterval]  The maximum retry interval, in milliseconds.
         */
        function ExponentialRetryPolicy(nextPolicy, options, retryCount, retryInterval, minRetryInterval, maxRetryInterval) {
            var _this = _super.call(this, nextPolicy, options) || this;
            function isNumber(n) { return typeof n === "number"; }
            _this.retryCount = isNumber(retryCount) ? retryCount : DEFAULT_CLIENT_RETRY_COUNT;
            _this.retryInterval = isNumber(retryInterval) ? retryInterval : DEFAULT_CLIENT_RETRY_INTERVAL;
            _this.minRetryInterval = isNumber(minRetryInterval) ? minRetryInterval : DEFAULT_CLIENT_MIN_RETRY_INTERVAL;
            _this.maxRetryInterval = isNumber(maxRetryInterval) ? maxRetryInterval : DEFAULT_CLIENT_MAX_RETRY_INTERVAL;
            return _this;
        }
        ExponentialRetryPolicy.prototype.sendRequest = function (request) {
            var _this = this;
            return this._nextPolicy.sendRequest(request.clone())
                .then(function (response) { return retry(_this, request, response); })
                .catch(function (error) { return retry(_this, request, error.response, undefined, error); });
        };
        return ExponentialRetryPolicy;
    }(BaseRequestPolicy));
    /**
     * Determines if the operation should be retried and how long to wait until the next retry.
     *
     * @param {ExponentialRetryPolicy} policy The ExponentialRetryPolicy that this function is being called against.
     * @param {number} statusCode The HTTP status code.
     * @param {RetryData} retryData  The retry data.
     * @return {boolean} True if the operation qualifies for a retry; false otherwise.
     */
    function shouldRetry(policy, statusCode, retryData) {
        if (statusCode == undefined || (statusCode < 500 && statusCode !== 408) || statusCode === 501 || statusCode === 505) {
            return false;
        }
        var currentCount;
        if (!retryData) {
            throw new Error("retryData for the ExponentialRetryPolicyFilter cannot be null.");
        }
        else {
            currentCount = (retryData && retryData.retryCount);
        }
        return (currentCount < policy.retryCount);
    }
    /**
     * Updates the retry data for the next attempt.
     *
     * @param {ExponentialRetryPolicy} policy The ExponentialRetryPolicy that this function is being called against.
     * @param {RetryData} retryData  The retry data.
     * @param {RetryError} [err] The operation"s error, if any.
     */
    function updateRetryData(policy, retryData, err) {
        if (!retryData) {
            retryData = {
                retryCount: 0,
                retryInterval: 0
            };
        }
        if (err) {
            if (retryData.error) {
                err.innerError = retryData.error;
            }
            retryData.error = err;
        }
        // Adjust retry count
        retryData.retryCount++;
        // Adjust retry interval
        var incrementDelta = Math.pow(2, retryData.retryCount) - 1;
        var boundedRandDelta = policy.retryInterval * 0.8 +
            Math.floor(Math.random() * (policy.retryInterval * 1.2 - policy.retryInterval * 0.8));
        incrementDelta *= boundedRandDelta;
        retryData.retryInterval = Math.min(policy.minRetryInterval + incrementDelta, policy.maxRetryInterval);
        return retryData;
    }
    function retry(policy, request, response, retryData, requestError) {
        retryData = updateRetryData(policy, retryData, requestError);
        var isAborted = request.abortSignal && request.abortSignal.aborted;
        if (!isAborted && shouldRetry(policy, response && response.status, retryData)) {
            return delay(retryData.retryInterval)
                .then(function () { return policy._nextPolicy.sendRequest(request.clone()); })
                .then(function (res) { return retry(policy, request, res, retryData, undefined); })
                .catch(function (err) { return retry(policy, request, response, retryData, err); });
        }
        else if (isAborted || requestError || !response) {
            // If the operation failed in the end, return all errors instead of just the last one
            var err = retryData.error ||
                new RestError("Failed to send the request.", RestError.REQUEST_SEND_ERROR, response && response.status, response && response.request, response);
            return Promise.reject(err);
        }
        else {
            return Promise.resolve(response);
        }
    }

    // Copyright (c) Microsoft Corporation. All rights reserved.
    function generateClientRequestIdPolicy(requestIdHeaderName) {
        if (requestIdHeaderName === void 0) { requestIdHeaderName = "x-ms-client-request-id"; }
        return {
            create: function (nextPolicy, options) {
                return new GenerateClientRequestIdPolicy(nextPolicy, options, requestIdHeaderName);
            }
        };
    }
    var GenerateClientRequestIdPolicy = /** @class */ (function (_super) {
        __extends(GenerateClientRequestIdPolicy, _super);
        function GenerateClientRequestIdPolicy(nextPolicy, options, _requestIdHeaderName) {
            var _this = _super.call(this, nextPolicy, options) || this;
            _this._requestIdHeaderName = _requestIdHeaderName;
            return _this;
        }
        GenerateClientRequestIdPolicy.prototype.sendRequest = function (request) {
            if (!request.headers.contains(this._requestIdHeaderName)) {
                request.headers.set(this._requestIdHeaderName, generateUuid());
            }
            return this._nextPolicy.sendRequest(request);
        };
        return GenerateClientRequestIdPolicy;
    }(BaseRequestPolicy));

    // Copyright (c) Microsoft Corporation. All rights reserved.
    // Licensed under the MIT License. See License.txt in the project root for license information.
    function getDefaultUserAgentKey() {
        return "x-ms-command-name";
    }
    function getPlatformSpecificData() {
        var navigator = window.navigator;
        var osInfo = {
            key: "OS",
            value: (navigator.oscpu || navigator.platform).replace(" ", "")
        };
        return [osInfo];
    }

    // Copyright (c) Microsoft Corporation. All rights reserved.
    function getRuntimeInfo() {
        var msRestRuntime = {
            key: "ms-rest-js",
            value: Constants.msRestVersion
        };
        return [msRestRuntime];
    }
    function getUserAgentString(telemetryInfo, keySeparator, valueSeparator) {
        if (keySeparator === void 0) { keySeparator = " "; }
        if (valueSeparator === void 0) { valueSeparator = "/"; }
        return telemetryInfo.map(function (info) {
            var value = info.value ? "" + valueSeparator + info.value : "";
            return "" + info.key + value;
        }).join(keySeparator);
    }
    var getDefaultUserAgentHeaderName = getDefaultUserAgentKey;
    function getDefaultUserAgentValue() {
        var runtimeInfo = getRuntimeInfo();
        var platformSpecificData = getPlatformSpecificData();
        var userAgent = getUserAgentString(runtimeInfo.concat(platformSpecificData));
        return userAgent;
    }
    function userAgentPolicy(userAgentData) {
        var key = (!userAgentData || userAgentData.key == undefined) ? getDefaultUserAgentKey() : userAgentData.key;
        var value = (!userAgentData || userAgentData.value == undefined) ? getDefaultUserAgentValue() : userAgentData.value;
        return {
            create: function (nextPolicy, options) {
                return new UserAgentPolicy(nextPolicy, options, key, value);
            }
        };
    }
    var UserAgentPolicy = /** @class */ (function (_super) {
        __extends(UserAgentPolicy, _super);
        function UserAgentPolicy(_nextPolicy, _options, headerKey, headerValue) {
            var _this = _super.call(this, _nextPolicy, _options) || this;
            _this._nextPolicy = _nextPolicy;
            _this._options = _options;
            _this.headerKey = headerKey;
            _this.headerValue = headerValue;
            return _this;
        }
        UserAgentPolicy.prototype.sendRequest = function (request) {
            this.addUserAgentHeader(request);
            return this._nextPolicy.sendRequest(request);
        };
        UserAgentPolicy.prototype.addUserAgentHeader = function (request) {
            if (!request.headers) {
                request.headers = new HttpHeaders();
            }
            if (!request.headers.get(this.headerKey) && this.headerValue) {
                request.headers.set(this.headerKey, this.headerValue);
            }
        };
        return UserAgentPolicy;
    }(BaseRequestPolicy));

    // Copyright (c) Microsoft Corporation. All rights reserved.
    /**
     * A class that handles the query portion of a URLBuilder.
     */
    var URLQuery = /** @class */ (function () {
        function URLQuery() {
            this._rawQuery = {};
        }
        /**
         * Get whether or not there any query parameters in this URLQuery.
         */
        URLQuery.prototype.any = function () {
            return Object.keys(this._rawQuery).length > 0;
        };
        /**
         * Set a query parameter with the provided name and value. If the parameterValue is undefined or
         * empty, then this will attempt to remove an existing query parameter with the provided
         * parameterName.
         */
        URLQuery.prototype.set = function (parameterName, parameterValue) {
            if (parameterName) {
                if (parameterValue != undefined) {
                    var newValue = Array.isArray(parameterValue) ? parameterValue : parameterValue.toString();
                    this._rawQuery[parameterName] = newValue;
                }
                else {
                    delete this._rawQuery[parameterName];
                }
            }
        };
        /**
         * Get the value of the query parameter with the provided name. If no parameter exists with the
         * provided parameter name, then undefined will be returned.
         */
        URLQuery.prototype.get = function (parameterName) {
            return parameterName ? this._rawQuery[parameterName] : undefined;
        };
        /**
         * Get the string representation of this query. The return value will not start with a "?".
         */
        URLQuery.prototype.toString = function () {
            var result = "";
            for (var parameterName in this._rawQuery) {
                if (result) {
                    result += "&";
                }
                var parameterValue = this._rawQuery[parameterName];
                if (Array.isArray(parameterValue)) {
                    var parameterStrings = [];
                    for (var _i = 0, parameterValue_1 = parameterValue; _i < parameterValue_1.length; _i++) {
                        var parameterValueElement = parameterValue_1[_i];
                        parameterStrings.push(parameterName + "=" + parameterValueElement);
                    }
                    result += parameterStrings.join("&");
                }
                else {
                    result += parameterName + "=" + parameterValue;
                }
            }
            return result;
        };
        /**
         * Parse a URLQuery from the provided text.
         */
        URLQuery.parse = function (text) {
            var result = new URLQuery();
            if (text) {
                if (text.startsWith("?")) {
                    text = text.substring(1);
                }
                var currentState = "ParameterName";
                var parameterName = "";
                var parameterValue = "";
                for (var i = 0; i < text.length; ++i) {
                    var currentCharacter = text[i];
                    switch (currentState) {
                        case "ParameterName":
                            switch (currentCharacter) {
                                case "=":
                                    currentState = "ParameterValue";
                                    break;
                                case "&":
                                    parameterName = "";
                                    parameterValue = "";
                                    break;
                                default:
                                    parameterName += currentCharacter;
                                    break;
                            }
                            break;
                        case "ParameterValue":
                            switch (currentCharacter) {
                                case "=":
                                    parameterName = "";
                                    parameterValue = "";
                                    currentState = "Invalid";
                                    break;
                                case "&":
                                    result.set(parameterName, parameterValue);
                                    parameterName = "";
                                    parameterValue = "";
                                    currentState = "ParameterName";
                                    break;
                                default:
                                    parameterValue += currentCharacter;
                                    break;
                            }
                            break;
                        case "Invalid":
                            if (currentCharacter === "&") {
                                currentState = "ParameterName";
                            }
                            break;
                        default:
                            throw new Error("Unrecognized URLQuery parse state: " + currentState);
                    }
                }
                if (currentState === "ParameterValue") {
                    result.set(parameterName, parameterValue);
                }
            }
            return result;
        };
        return URLQuery;
    }());
    /**
     * A class that handles creating, modifying, and parsing URLs.
     */
    var URLBuilder = /** @class */ (function () {
        function URLBuilder() {
        }
        /**
         * Set the scheme/protocol for this URL. If the provided scheme contains other parts of a URL
         * (such as a host, port, path, or query), those parts will be added to this URL as well.
         */
        URLBuilder.prototype.setScheme = function (scheme) {
            if (!scheme) {
                this._scheme = undefined;
            }
            else {
                this.set(scheme, "SCHEME");
            }
        };
        /**
         * Get the scheme that has been set in this URL.
         */
        URLBuilder.prototype.getScheme = function () {
            return this._scheme;
        };
        /**
         * Set the host for this URL. If the provided host contains other parts of a URL (such as a
         * port, path, or query), those parts will be added to this URL as well.
         */
        URLBuilder.prototype.setHost = function (host) {
            if (!host) {
                this._host = undefined;
            }
            else {
                this.set(host, "SCHEME_OR_HOST");
            }
        };
        /**
         * Get the host that has been set in this URL.
         */
        URLBuilder.prototype.getHost = function () {
            return this._host;
        };
        /**
         * Set the port for this URL. If the provided port contains other parts of a URL (such as a
         * path or query), those parts will be added to this URL as well.
         */
        URLBuilder.prototype.setPort = function (port) {
            if (port == undefined || port === "") {
                this._port = undefined;
            }
            else {
                this.set(port.toString(), "PORT");
            }
        };
        /**
         * Get the port that has been set in this URL.
         */
        URLBuilder.prototype.getPort = function () {
            return this._port;
        };
        /**
         * Set the path for this URL. If the provided path contains a query, then it will be added to
         * this URL as well.
         */
        URLBuilder.prototype.setPath = function (path) {
            if (!path) {
                this._path = undefined;
            }
            else {
                if (path.indexOf("://") !== -1) {
                    this.set(path, "SCHEME");
                }
                else {
                    this.set(path, "PATH");
                }
            }
        };
        /**
         * Append the provided path to this URL's existing path. If the provided path contains a query,
         * then it will be added to this URL as well.
         */
        URLBuilder.prototype.appendPath = function (path) {
            if (path) {
                var currentPath = this.getPath();
                if (currentPath) {
                    if (!currentPath.endsWith("/")) {
                        currentPath += "/";
                    }
                    if (path.startsWith("/")) {
                        path = path.substring(1);
                    }
                    path = currentPath + path;
                }
                this.set(path, "PATH");
            }
        };
        /**
         * Get the path that has been set in this URL.
         */
        URLBuilder.prototype.getPath = function () {
            return this._path;
        };
        /**
         * Set the query in this URL.
         */
        URLBuilder.prototype.setQuery = function (query) {
            if (!query) {
                this._query = undefined;
            }
            else {
                this._query = URLQuery.parse(query);
            }
        };
        /**
         * Set a query parameter with the provided name and value in this URL's query. If the provided
         * query parameter value is undefined or empty, then the query parameter will be removed if it
         * existed.
         */
        URLBuilder.prototype.setQueryParameter = function (queryParameterName, queryParameterValue) {
            if (queryParameterName) {
                if (!this._query) {
                    this._query = new URLQuery();
                }
                this._query.set(queryParameterName, queryParameterValue);
            }
        };
        /**
         * Get the value of the query parameter with the provided query parameter name. If no query
         * parameter exists with the provided name, then undefined will be returned.
         */
        URLBuilder.prototype.getQueryParameterValue = function (queryParameterName) {
            return this._query ? this._query.get(queryParameterName) : undefined;
        };
        /**
         * Get the query in this URL.
         */
        URLBuilder.prototype.getQuery = function () {
            return this._query ? this._query.toString() : undefined;
        };
        /**
         * Set the parts of this URL by parsing the provided text using the provided startState.
         */
        URLBuilder.prototype.set = function (text, startState) {
            var tokenizer = new URLTokenizer(text, startState);
            while (tokenizer.next()) {
                var token = tokenizer.current();
                if (token) {
                    switch (token.type) {
                        case "SCHEME":
                            this._scheme = token.text || undefined;
                            break;
                        case "HOST":
                            this._host = token.text || undefined;
                            break;
                        case "PORT":
                            this._port = token.text || undefined;
                            break;
                        case "PATH":
                            var tokenPath = token.text || undefined;
                            if (!this._path || this._path === "/" || tokenPath !== "/") {
                                this._path = tokenPath;
                            }
                            break;
                        case "QUERY":
                            this._query = URLQuery.parse(token.text);
                            break;
                        default:
                            throw new Error("Unrecognized URLTokenType: " + token.type);
                    }
                }
            }
        };
        URLBuilder.prototype.toString = function () {
            var result = "";
            if (this._scheme) {
                result += this._scheme + "://";
            }
            if (this._host) {
                result += this._host;
            }
            if (this._port) {
                result += ":" + this._port;
            }
            if (this._path) {
                if (!this._path.startsWith("/")) {
                    result += "/";
                }
                result += this._path;
            }
            if (this._query && this._query.any()) {
                result += "?" + this._query.toString();
            }
            return result;
        };
        /**
         * If the provided searchValue is found in this URLBuilder, then replace it with the provided
         * replaceValue.
         */
        URLBuilder.prototype.replaceAll = function (searchValue, replaceValue) {
            if (searchValue) {
                this.setScheme(replaceAll(this.getScheme(), searchValue, replaceValue));
                this.setHost(replaceAll(this.getHost(), searchValue, replaceValue));
                this.setPort(replaceAll(this.getPort(), searchValue, replaceValue));
                this.setPath(replaceAll(this.getPath(), searchValue, replaceValue));
                this.setQuery(replaceAll(this.getQuery(), searchValue, replaceValue));
            }
        };
        URLBuilder.parse = function (text) {
            var result = new URLBuilder();
            result.set(text, "SCHEME_OR_HOST");
            return result;
        };
        return URLBuilder;
    }());
    var URLToken = /** @class */ (function () {
        function URLToken(text, type) {
            this.text = text;
            this.type = type;
        }
        URLToken.scheme = function (text) {
            return new URLToken(text, "SCHEME");
        };
        URLToken.host = function (text) {
            return new URLToken(text, "HOST");
        };
        URLToken.port = function (text) {
            return new URLToken(text, "PORT");
        };
        URLToken.path = function (text) {
            return new URLToken(text, "PATH");
        };
        URLToken.query = function (text) {
            return new URLToken(text, "QUERY");
        };
        return URLToken;
    }());
    /**
     * Get whether or not the provided character (single character string) is an alphanumeric (letter or
     * digit) character.
     */
    function isAlphaNumericCharacter(character) {
        var characterCode = character.charCodeAt(0);
        return (48 /* '0' */ <= characterCode && characterCode <= 57 /* '9' */) ||
            (65 /* 'A' */ <= characterCode && characterCode <= 90 /* 'Z' */) ||
            (97 /* 'a' */ <= characterCode && characterCode <= 122 /* 'z' */);
    }
    /**
     * A class that tokenizes URL strings.
     */
    var URLTokenizer = /** @class */ (function () {
        function URLTokenizer(_text, state) {
            this._text = _text;
            this._textLength = _text ? _text.length : 0;
            this._currentState = state != undefined ? state : "SCHEME_OR_HOST";
            this._currentIndex = 0;
        }
        /**
         * Get the current URLToken this URLTokenizer is pointing at, or undefined if the URLTokenizer
         * hasn't started or has finished tokenizing.
         */
        URLTokenizer.prototype.current = function () {
            return this._currentToken;
        };
        /**
         * Advance to the next URLToken and return whether or not a URLToken was found.
         */
        URLTokenizer.prototype.next = function () {
            if (!hasCurrentCharacter(this)) {
                this._currentToken = undefined;
            }
            else {
                switch (this._currentState) {
                    case "SCHEME":
                        nextScheme(this);
                        break;
                    case "SCHEME_OR_HOST":
                        nextSchemeOrHost(this);
                        break;
                    case "HOST":
                        nextHost(this);
                        break;
                    case "PORT":
                        nextPort(this);
                        break;
                    case "PATH":
                        nextPath(this);
                        break;
                    case "QUERY":
                        nextQuery(this);
                        break;
                    default:
                        throw new Error("Unrecognized URLTokenizerState: " + this._currentState);
                }
            }
            return !!this._currentToken;
        };
        return URLTokenizer;
    }());
    /**
     * Read the remaining characters from this Tokenizer's character stream.
     */
    function readRemaining(tokenizer) {
        var result = "";
        if (tokenizer._currentIndex < tokenizer._textLength) {
            result = tokenizer._text.substring(tokenizer._currentIndex);
            tokenizer._currentIndex = tokenizer._textLength;
        }
        return result;
    }
    /**
     * Whether or not this URLTokenizer has a current character.
     */
    function hasCurrentCharacter(tokenizer) {
        return tokenizer._currentIndex < tokenizer._textLength;
    }
    /**
     * Get the character in the text string at the current index.
     */
    function getCurrentCharacter(tokenizer) {
        return tokenizer._text[tokenizer._currentIndex];
    }
    /**
     * Advance to the character in text that is "step" characters ahead. If no step value is provided,
     * then step will default to 1.
     */
    function nextCharacter(tokenizer, step) {
        if (hasCurrentCharacter(tokenizer)) {
            if (!step) {
                step = 1;
            }
            tokenizer._currentIndex += step;
        }
    }
    /**
     * Starting with the current character, peek "charactersToPeek" number of characters ahead in this
     * Tokenizer's stream of characters.
     */
    function peekCharacters(tokenizer, charactersToPeek) {
        var endIndex = tokenizer._currentIndex + charactersToPeek;
        if (tokenizer._textLength < endIndex) {
            endIndex = tokenizer._textLength;
        }
        return tokenizer._text.substring(tokenizer._currentIndex, endIndex);
    }
    /**
     * Read characters from this Tokenizer until the end of the stream or until the provided condition
     * is false when provided the current character.
     */
    function readWhile(tokenizer, condition) {
        var result = "";
        while (hasCurrentCharacter(tokenizer)) {
            var currentCharacter = getCurrentCharacter(tokenizer);
            if (!condition(currentCharacter)) {
                break;
            }
            else {
                result += currentCharacter;
                nextCharacter(tokenizer);
            }
        }
        return result;
    }
    /**
     * Read characters from this Tokenizer until a non-alphanumeric character or the end of the
     * character stream is reached.
     */
    function readWhileLetterOrDigit(tokenizer) {
        return readWhile(tokenizer, function (character) { return isAlphaNumericCharacter(character); });
    }
    /**
     * Read characters from this Tokenizer until one of the provided terminating characters is read or
     * the end of the character stream is reached.
     */
    function readUntilCharacter(tokenizer) {
        var terminatingCharacters = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            terminatingCharacters[_i - 1] = arguments[_i];
        }
        return readWhile(tokenizer, function (character) { return terminatingCharacters.indexOf(character) === -1; });
    }
    function nextScheme(tokenizer) {
        var scheme = readWhileLetterOrDigit(tokenizer);
        tokenizer._currentToken = URLToken.scheme(scheme);
        if (!hasCurrentCharacter(tokenizer)) {
            tokenizer._currentState = "DONE";
        }
        else {
            tokenizer._currentState = "HOST";
        }
    }
    function nextSchemeOrHost(tokenizer) {
        var schemeOrHost = readUntilCharacter(tokenizer, ":", "/", "?");
        if (!hasCurrentCharacter(tokenizer)) {
            tokenizer._currentToken = URLToken.host(schemeOrHost);
            tokenizer._currentState = "DONE";
        }
        else if (getCurrentCharacter(tokenizer) === ":") {
            if (peekCharacters(tokenizer, 3) === "://") {
                tokenizer._currentToken = URLToken.scheme(schemeOrHost);
                tokenizer._currentState = "HOST";
            }
            else {
                tokenizer._currentToken = URLToken.host(schemeOrHost);
                tokenizer._currentState = "PORT";
            }
        }
        else {
            tokenizer._currentToken = URLToken.host(schemeOrHost);
            if (getCurrentCharacter(tokenizer) === "/") {
                tokenizer._currentState = "PATH";
            }
            else {
                tokenizer._currentState = "QUERY";
            }
        }
    }
    function nextHost(tokenizer) {
        if (peekCharacters(tokenizer, 3) === "://") {
            nextCharacter(tokenizer, 3);
        }
        var host = readUntilCharacter(tokenizer, ":", "/", "?");
        tokenizer._currentToken = URLToken.host(host);
        if (!hasCurrentCharacter(tokenizer)) {
            tokenizer._currentState = "DONE";
        }
        else if (getCurrentCharacter(tokenizer) === ":") {
            tokenizer._currentState = "PORT";
        }
        else if (getCurrentCharacter(tokenizer) === "/") {
            tokenizer._currentState = "PATH";
        }
        else {
            tokenizer._currentState = "QUERY";
        }
    }
    function nextPort(tokenizer) {
        if (getCurrentCharacter(tokenizer) === ":") {
            nextCharacter(tokenizer);
        }
        var port = readUntilCharacter(tokenizer, "/", "?");
        tokenizer._currentToken = URLToken.port(port);
        if (!hasCurrentCharacter(tokenizer)) {
            tokenizer._currentState = "DONE";
        }
        else if (getCurrentCharacter(tokenizer) === "/") {
            tokenizer._currentState = "PATH";
        }
        else {
            tokenizer._currentState = "QUERY";
        }
    }
    function nextPath(tokenizer) {
        var path = readUntilCharacter(tokenizer, "?");
        tokenizer._currentToken = URLToken.path(path);
        if (!hasCurrentCharacter(tokenizer)) {
            tokenizer._currentState = "DONE";
        }
        else {
            tokenizer._currentState = "QUERY";
        }
    }
    function nextQuery(tokenizer) {
        if (getCurrentCharacter(tokenizer) === "?") {
            nextCharacter(tokenizer);
        }
        var query = readRemaining(tokenizer);
        tokenizer._currentToken = URLToken.query(query);
        tokenizer._currentState = "DONE";
    }

    // Copyright (c) Microsoft Corporation. All rights reserved.
    function redirectPolicy(maximumRetries) {
        if (maximumRetries === void 0) { maximumRetries = 20; }
        return {
            create: function (nextPolicy, options) {
                return new RedirectPolicy(nextPolicy, options, maximumRetries);
            }
        };
    }
    var RedirectPolicy = /** @class */ (function (_super) {
        __extends(RedirectPolicy, _super);
        function RedirectPolicy(nextPolicy, options, maxRetries) {
            if (maxRetries === void 0) { maxRetries = 20; }
            var _this = _super.call(this, nextPolicy, options) || this;
            _this.maxRetries = maxRetries;
            return _this;
        }
        RedirectPolicy.prototype.sendRequest = function (request) {
            var _this = this;
            return this._nextPolicy.sendRequest(request).then(function (response) { return handleRedirect(_this, response, 0); });
        };
        return RedirectPolicy;
    }(BaseRequestPolicy));
    function handleRedirect(policy, response, currentRetries) {
        var request = response.request, status = response.status;
        var locationHeader = response.headers.get("location");
        if (locationHeader &&
            (status === 300 || status === 307 || (status === 303 && request.method === "POST")) &&
            (!policy.maxRetries || currentRetries < policy.maxRetries)) {
            var builder = URLBuilder.parse(request.url);
            builder.setPath(locationHeader);
            request.url = builder.toString();
            // POST request with Status code 303 should be converted into a
            // redirected GET request if the redirect url is present in the location header
            if (status === 303) {
                request.method = "GET";
            }
            return policy._nextPolicy.sendRequest(request)
                .then(function (res) { return handleRedirect(policy, res, currentRetries + 1); });
        }
        return Promise.resolve(response);
    }

    function rpRegistrationPolicy(retryTimeout) {
        if (retryTimeout === void 0) { retryTimeout = 30; }
        return {
            create: function (nextPolicy, options) {
                return new RPRegistrationPolicy(nextPolicy, options, retryTimeout);
            }
        };
    }
    var RPRegistrationPolicy = /** @class */ (function (_super) {
        __extends(RPRegistrationPolicy, _super);
        function RPRegistrationPolicy(nextPolicy, options, _retryTimeout) {
            if (_retryTimeout === void 0) { _retryTimeout = 30; }
            var _this = _super.call(this, nextPolicy, options) || this;
            _this._retryTimeout = _retryTimeout;
            return _this;
        }
        RPRegistrationPolicy.prototype.sendRequest = function (request) {
            var _this = this;
            return this._nextPolicy.sendRequest(request.clone())
                .then(function (response) { return registerIfNeeded(_this, request, response); });
        };
        return RPRegistrationPolicy;
    }(BaseRequestPolicy));
    function registerIfNeeded(policy, request, response) {
        if (response.status === 409) {
            var rpName = checkRPNotRegisteredError(response.bodyAsText);
            if (rpName) {
                var urlPrefix = extractSubscriptionUrl(request.url);
                return registerRP(policy, urlPrefix, rpName, request)
                    // Autoregistration of ${provider} failed for some reason. We will not return this error
                    // instead will return the initial response with 409 status code back to the user.
                    // do nothing here as we are returning the original response at the end of this method.
                    .catch(function () { return false; })
                    .then(function (registrationStatus) {
                    if (registrationStatus) {
                        // Retry the original request. We have to change the x-ms-client-request-id
                        // otherwise Azure endpoint will return the initial 409 (cached) response.
                        request.headers.set("x-ms-client-request-id", generateUuid());
                        return policy._nextPolicy.sendRequest(request.clone());
                    }
                    return response;
                });
            }
        }
        return Promise.resolve(response);
    }
    /**
     * Reuses the headers of the original request and url (if specified).
     * @param {WebResource} originalRequest The original request
     * @param {boolean} reuseUrlToo Should the url from the original request be reused as well. Default false.
     * @returns {object} A new request object with desired headers.
     */
    function getRequestEssentials(originalRequest, reuseUrlToo) {
        if (reuseUrlToo === void 0) { reuseUrlToo = false; }
        var reqOptions = originalRequest.clone();
        if (reuseUrlToo) {
            reqOptions.url = originalRequest.url;
        }
        // We have to change the x-ms-client-request-id otherwise Azure endpoint
        // will return the initial 409 (cached) response.
        reqOptions.headers.set("x-ms-client-request-id", generateUuid());
        // Set content-type to application/json
        reqOptions.headers.set("Content-Type", "application/json; charset=utf-8");
        return reqOptions;
    }
    /**
     * Validates the error code and message associated with 409 response status code. If it matches to that of
     * RP not registered then it returns the name of the RP else returns undefined.
     * @param {string} body The response body received after making the original request.
     * @returns {string} The name of the RP if condition is satisfied else undefined.
     */
    function checkRPNotRegisteredError(body) {
        var result, responseBody;
        if (body) {
            try {
                responseBody = JSON.parse(body);
            }
            catch (err) {
                // do nothing;
            }
            if (responseBody && responseBody.error && responseBody.error.message &&
                responseBody.error.code && responseBody.error.code === "MissingSubscriptionRegistration") {
                var matchRes = responseBody.error.message.match(/.*'(.*)'/i);
                if (matchRes) {
                    result = matchRes.pop();
                }
            }
        }
        return result;
    }
    /**
     * Extracts the first part of the URL, just after subscription:
     * https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/
     * @param {string} url The original request url
     * @returns {string} The url prefix as explained above.
     */
    function extractSubscriptionUrl(url) {
        var result;
        var matchRes = url.match(/.*\/subscriptions\/[a-f0-9-]+\//ig);
        if (matchRes && matchRes[0]) {
            result = matchRes[0];
        }
        else {
            throw new Error("Unable to extract subscriptionId from the given url - " + url + ".");
        }
        return result;
    }
    /**
     * Registers the given provider.
     * @param {RPRegistrationPolicy} policy The RPRegistrationPolicy this function is being called against.
     * @param {string} urlPrefix https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/
     * @param {string} provider The provider name to be registered.
     * @param {WebResource} originalRequest The original request sent by the user that returned a 409 response
     * with a message that the provider is not registered.
     * @param {registrationCallback} callback The callback that handles the RP registration
     */
    function registerRP(policy, urlPrefix, provider, originalRequest) {
        var postUrl = urlPrefix + "providers/" + provider + "/register?api-version=2016-02-01";
        var getUrl = urlPrefix + "providers/" + provider + "?api-version=2016-02-01";
        var reqOptions = getRequestEssentials(originalRequest);
        reqOptions.method = "POST";
        reqOptions.url = postUrl;
        return policy._nextPolicy.sendRequest(reqOptions)
            .then(function (response) {
            if (response.status !== 200) {
                throw new Error("Autoregistration of " + provider + " failed. Please try registering manually.");
            }
            return getRegistrationStatus(policy, getUrl, originalRequest);
        });
    }
    /**
     * Polls the registration status of the provider that was registered. Polling happens at an interval of 30 seconds.
     * Polling will happen till the registrationState property of the response body is "Registered".
     * @param {RPRegistrationPolicy} policy The RPRegistrationPolicy this function is being called against.
     * @param {string} url The request url for polling
     * @param {WebResource} originalRequest The original request sent by the user that returned a 409 response
     * with a message that the provider is not registered.
     * @returns {Promise<boolean>} True if RP Registration is successful.
     */
    function getRegistrationStatus(policy, url, originalRequest) {
        var reqOptions = getRequestEssentials(originalRequest);
        reqOptions.url = url;
        reqOptions.method = "GET";
        return policy._nextPolicy.sendRequest(reqOptions).then(function (res) {
            var obj = res.parsedBody;
            if (res.parsedBody && obj.registrationState && obj.registrationState === "Registered") {
                return true;
            }
            else {
                return delay(policy._retryTimeout * 1000).then(function () { return getRegistrationStatus(policy, url, originalRequest); });
            }
        });
    }

    // Copyright (c) Microsoft Corporation. All rights reserved.
    function signingPolicy(authenticationProvider) {
        return {
            create: function (nextPolicy, options) {
                return new SigningPolicy(nextPolicy, options, authenticationProvider);
            }
        };
    }
    var SigningPolicy = /** @class */ (function (_super) {
        __extends(SigningPolicy, _super);
        function SigningPolicy(nextPolicy, options, authenticationProvider) {
            var _this = _super.call(this, nextPolicy, options) || this;
            _this.authenticationProvider = authenticationProvider;
            return _this;
        }
        SigningPolicy.prototype.signRequest = function (request) {
            return this.authenticationProvider.signRequest(request);
        };
        SigningPolicy.prototype.sendRequest = function (request) {
            var _this = this;
            return this.signRequest(request).then(function (nextRequest) { return _this._nextPolicy.sendRequest(nextRequest); });
        };
        return SigningPolicy;
    }(BaseRequestPolicy));

    // Copyright (c) Microsoft Corporation. All rights reserved.
    function systemErrorRetryPolicy(retryCount, retryInterval, minRetryInterval, maxRetryInterval) {
        return {
            create: function (nextPolicy, options) {
                return new SystemErrorRetryPolicy(nextPolicy, options, retryCount, retryInterval, minRetryInterval, maxRetryInterval);
            }
        };
    }
    /**
     * @class
     * Instantiates a new "ExponentialRetryPolicyFilter" instance.
     *
     * @constructor
     * @param {number} retryCount        The client retry count.
     * @param {number} retryInterval     The client retry interval, in milliseconds.
     * @param {number} minRetryInterval  The minimum retry interval, in milliseconds.
     * @param {number} maxRetryInterval  The maximum retry interval, in milliseconds.
     */
    var SystemErrorRetryPolicy = /** @class */ (function (_super) {
        __extends(SystemErrorRetryPolicy, _super);
        function SystemErrorRetryPolicy(nextPolicy, options, retryCount, retryInterval, minRetryInterval, maxRetryInterval) {
            var _this = _super.call(this, nextPolicy, options) || this;
            _this.DEFAULT_CLIENT_RETRY_INTERVAL = 1000 * 30;
            _this.DEFAULT_CLIENT_RETRY_COUNT = 3;
            _this.DEFAULT_CLIENT_MAX_RETRY_INTERVAL = 1000 * 90;
            _this.DEFAULT_CLIENT_MIN_RETRY_INTERVAL = 1000 * 3;
            _this.retryCount = typeof retryCount === "number" ? retryCount : _this.DEFAULT_CLIENT_RETRY_COUNT;
            _this.retryInterval = typeof retryInterval === "number" ? retryInterval : _this.DEFAULT_CLIENT_RETRY_INTERVAL;
            _this.minRetryInterval = typeof minRetryInterval === "number" ? minRetryInterval : _this.DEFAULT_CLIENT_MIN_RETRY_INTERVAL;
            _this.maxRetryInterval = typeof maxRetryInterval === "number" ? maxRetryInterval : _this.DEFAULT_CLIENT_MAX_RETRY_INTERVAL;
            return _this;
        }
        SystemErrorRetryPolicy.prototype.sendRequest = function (request) {
            var _this = this;
            return this._nextPolicy.sendRequest(request.clone()).then(function (response) { return retry$1(_this, request, response); });
        };
        return SystemErrorRetryPolicy;
    }(BaseRequestPolicy));
    /**
     * Determines if the operation should be retried and how long to wait until the next retry.
     *
     * @param {number} statusCode The HTTP status code.
     * @param {RetryData} retryData  The retry data.
     * @return {boolean} True if the operation qualifies for a retry; false otherwise.
     */
    function shouldRetry$1(policy, retryData) {
        var currentCount;
        if (!retryData) {
            throw new Error("retryData for the SystemErrorRetryPolicyFilter cannot be null.");
        }
        else {
            currentCount = (retryData && retryData.retryCount);
        }
        return (currentCount < policy.retryCount);
    }
    /**
     * Updates the retry data for the next attempt.
     *
     * @param {RetryData} retryData  The retry data.
     * @param {object} err        The operation"s error, if any.
     */
    function updateRetryData$1(policy, retryData, err) {
        if (!retryData) {
            retryData = {
                retryCount: 0,
                retryInterval: 0
            };
        }
        if (err) {
            if (retryData.error) {
                err.innerError = retryData.error;
            }
            retryData.error = err;
        }
        // Adjust retry count
        retryData.retryCount++;
        // Adjust retry interval
        var incrementDelta = Math.pow(2, retryData.retryCount) - 1;
        var boundedRandDelta = policy.retryInterval * 0.8 +
            Math.floor(Math.random() * (policy.retryInterval * 1.2 - policy.retryInterval * 0.8));
        incrementDelta *= boundedRandDelta;
        retryData.retryInterval = Math.min(policy.minRetryInterval + incrementDelta, policy.maxRetryInterval);
        return retryData;
    }
    function retry$1(policy, request, operationResponse, retryData, err) {
        retryData = updateRetryData$1(policy, retryData, err);
        if (err && err.code && shouldRetry$1(policy, retryData) &&
            (err.code === "ETIMEDOUT" || err.code === "ESOCKETTIMEDOUT" || err.code === "ECONNREFUSED" ||
                err.code === "ECONNRESET" || err.code === "ENOENT")) {
            // If previous operation ended with an error and the policy allows a retry, do that
            return delay(retryData.retryInterval)
                .then(function () { return policy._nextPolicy.sendRequest(request.clone()); })
                .then(function (res) { return retry$1(policy, request, res, retryData, err); })
                .catch(function (err) { return retry$1(policy, request, operationResponse, retryData, err); });
        }
        else {
            if (err != undefined) {
                // If the operation failed in the end, return all errors instead of just the last one
                err = retryData.error;
                return Promise.reject(err);
            }
            return Promise.resolve(operationResponse);
        }
    }

    // Copyright (c) Microsoft Corporation. All rights reserved.
    // Licensed under the MIT License. See License.txt in the project root for license information.
    /**
     * The format that will be used to join an array of values together for a query parameter value.
     */
    var QueryCollectionFormat;
    (function (QueryCollectionFormat) {
        QueryCollectionFormat["Csv"] = ",";
        QueryCollectionFormat["Ssv"] = " ";
        QueryCollectionFormat["Tsv"] = "\t";
        QueryCollectionFormat["Pipes"] = "|";
        QueryCollectionFormat["Multi"] = "Multi";
    })(QueryCollectionFormat || (QueryCollectionFormat = {}));

    // Copyright (c) Microsoft Corporation. All rights reserved.
    function loadEnvironmentProxyValue() {
        if (!process) {
            return undefined;
        }
        if (process.env[Constants.HTTPS_PROXY]) {
            return process.env[Constants.HTTPS_PROXY];
        }
        else if (process.env[Constants.HTTPS_PROXY.toLowerCase()]) {
            return process.env[Constants.HTTPS_PROXY.toLowerCase()];
        }
        else if (process.env[Constants.HTTP_PROXY]) {
            return process.env[Constants.HTTP_PROXY];
        }
        else if (process.env[Constants.HTTP_PROXY.toLowerCase()]) {
            return process.env[Constants.HTTP_PROXY.toLowerCase()];
        }
        return undefined;
    }
    function getDefaultProxySettings(proxyUrl) {
        if (!proxyUrl) {
            proxyUrl = loadEnvironmentProxyValue();
            if (!proxyUrl) {
                return undefined;
            }
        }
        var parsedUrl = URLBuilder.parse(proxyUrl);
        return {
            host: parsedUrl.getScheme() + "://" + parsedUrl.getHost(),
            port: Number.parseInt(parsedUrl.getPort() || "80")
        };
    }
    function proxyPolicy(proxySettings) {
        return {
            create: function (nextPolicy, options) {
                return new ProxyPolicy(nextPolicy, options, proxySettings);
            }
        };
    }
    var ProxyPolicy = /** @class */ (function (_super) {
        __extends(ProxyPolicy, _super);
        function ProxyPolicy(nextPolicy, options, proxySettings) {
            var _this = _super.call(this, nextPolicy, options) || this;
            _this.proxySettings = proxySettings;
            return _this;
        }
        ProxyPolicy.prototype.sendRequest = function (request) {
            if (!request.proxySettings) {
                request.proxySettings = this.proxySettings;
            }
            return this._nextPolicy.sendRequest(request);
        };
        return ProxyPolicy;
    }(BaseRequestPolicy));

    // Copyright (c) Microsoft Corporation. All rights reserved.
    var StatusCodes = Constants.HttpConstants.StatusCodes;
    function throttlingRetryPolicy() {
        return {
            create: function (nextPolicy, options) {
                return new ThrottlingRetryPolicy(nextPolicy, options);
            }
        };
    }
    /**
     * To learn more, please refer to
     * https://docs.microsoft.com/en-us/azure/azure-resource-manager/resource-manager-request-limits,
     * https://docs.microsoft.com/en-us/azure/azure-subscription-service-limits and
     * https://docs.microsoft.com/en-us/azure/virtual-machines/troubleshooting/troubleshooting-throttling-errors
     */
    var ThrottlingRetryPolicy = /** @class */ (function (_super) {
        __extends(ThrottlingRetryPolicy, _super);
        function ThrottlingRetryPolicy(nextPolicy, options, _handleResponse) {
            var _this = _super.call(this, nextPolicy, options) || this;
            _this._handleResponse = _handleResponse || _this._defaultResponseHandler;
            return _this;
        }
        ThrottlingRetryPolicy.prototype.sendRequest = function (httpRequest) {
            return __awaiter(this, void 0, void 0, function () {
                var _this = this;
                return __generator(this, function (_a) {
                    return [2 /*return*/, this._nextPolicy.sendRequest(httpRequest.clone()).then(function (response) {
                            if (response.status !== StatusCodes.TooManyRequests) {
                                return response;
                            }
                            else {
                                return _this._handleResponse(httpRequest, response);
                            }
                        })];
                });
            });
        };
        ThrottlingRetryPolicy.prototype._defaultResponseHandler = function (httpRequest, httpResponse) {
            return __awaiter(this, void 0, void 0, function () {
                var retryAfterHeader, delayInMs;
                var _this = this;
                return __generator(this, function (_a) {
                    retryAfterHeader = httpResponse.headers.get(Constants.HeaderConstants.RETRY_AFTER);
                    if (retryAfterHeader) {
                        delayInMs = ThrottlingRetryPolicy.parseRetryAfterHeader(retryAfterHeader);
                        if (delayInMs) {
                            return [2 /*return*/, delay(delayInMs).then(function (_) { return _this._nextPolicy.sendRequest(httpRequest); })];
                        }
                    }
                    return [2 /*return*/, httpResponse];
                });
            });
        };
        ThrottlingRetryPolicy.parseRetryAfterHeader = function (headerValue) {
            var retryAfterInSeconds = Number(headerValue);
            if (Number.isNaN(retryAfterInSeconds)) {
                return ThrottlingRetryPolicy.parseDateRetryAfterHeader(headerValue);
            }
            else {
                return retryAfterInSeconds * 1000;
            }
        };
        ThrottlingRetryPolicy.parseDateRetryAfterHeader = function (headerValue) {
            try {
                var now = Date.now();
                var date = Date.parse(headerValue);
                var diff = date - now;
                return Number.isNaN(diff) ? undefined : diff;
            }
            catch (error) {
                return undefined;
            }
        };
        return ThrottlingRetryPolicy;
    }(BaseRequestPolicy));

    // Copyright (c) Microsoft Corporation. All rights reserved.
    /**
     * @class
     * Initializes a new instance of the ServiceClient.
     */
    var ServiceClient = /** @class */ (function () {
        /**
         * The ServiceClient constructor
         * @constructor
         * @param {ServiceClientCredentials} [credentials] The credentials object used for authentication.
         * @param {ServiceClientOptions} [options] The service client options that govern the behavior of the client.
         */
        function ServiceClient(credentials, options) {
            if (!options) {
                options = {};
            }
            if (credentials && !credentials.signRequest) {
                throw new Error("credentials argument needs to implement signRequest method");
            }
            this._withCredentials = options.withCredentials || false;
            this._httpClient = options.httpClient || new XhrHttpClient();
            this._requestPolicyOptions = new RequestPolicyOptions(options.httpPipelineLogger);
            var requestPolicyFactories;
            if (Array.isArray(options.requestPolicyFactories)) {
                requestPolicyFactories = options.requestPolicyFactories;
            }
            else {
                requestPolicyFactories = createDefaultRequestPolicyFactories(credentials, options);
                if (options.requestPolicyFactories) {
                    var newRequestPolicyFactories = options.requestPolicyFactories(requestPolicyFactories);
                    if (newRequestPolicyFactories) {
                        requestPolicyFactories = newRequestPolicyFactories;
                    }
                }
            }
            this._requestPolicyFactories = requestPolicyFactories;
        }
        /**
         * Send the provided httpRequest.
         */
        ServiceClient.prototype.sendRequest = function (options) {
            if (options === null || options === undefined || typeof options !== "object") {
                throw new Error("options cannot be null or undefined and it must be of type object.");
            }
            var httpRequest;
            try {
                if (options instanceof WebResource) {
                    options.validateRequestProperties();
                    httpRequest = options;
                }
                else {
                    httpRequest = new WebResource();
                    httpRequest = httpRequest.prepare(options);
                }
            }
            catch (error) {
                return Promise.reject(error);
            }
            var httpPipeline = this._httpClient;
            if (this._requestPolicyFactories && this._requestPolicyFactories.length > 0) {
                for (var i = this._requestPolicyFactories.length - 1; i >= 0; --i) {
                    httpPipeline = this._requestPolicyFactories[i].create(httpPipeline, this._requestPolicyOptions);
                }
            }
            return httpPipeline.sendRequest(httpRequest);
        };
        /**
         * Send an HTTP request that is populated using the provided OperationSpec.
         * @param {OperationArguments} operationArguments The arguments that the HTTP request's templated values will be populated from.
         * @param {OperationSpec} operationSpec The OperationSpec to use to populate the httpRequest.
         * @param {ServiceCallback} callback The callback to call when the response is received.
         */
        ServiceClient.prototype.sendOperationRequest = function (operationArguments, operationSpec, callback) {
            if (typeof operationArguments.options === "function") {
                callback = operationArguments.options;
                operationArguments.options = undefined;
            }
            var httpRequest = new WebResource();
            var result;
            try {
                var baseUri = operationSpec.baseUrl || this.baseUri;
                if (!baseUri) {
                    throw new Error("If operationSpec.baseUrl is not specified, then the ServiceClient must have a baseUri string property that contains the base URL to use.");
                }
                httpRequest.method = operationSpec.httpMethod;
                httpRequest.operationSpec = operationSpec;
                var requestUrl = URLBuilder.parse(baseUri);
                if (operationSpec.path) {
                    requestUrl.appendPath(operationSpec.path);
                }
                if (operationSpec.urlParameters && operationSpec.urlParameters.length > 0) {
                    for (var _i = 0, _a = operationSpec.urlParameters; _i < _a.length; _i++) {
                        var urlParameter = _a[_i];
                        var urlParameterValue = getOperationArgumentValueFromParameter(this, operationArguments, urlParameter, operationSpec.serializer);
                        urlParameterValue = operationSpec.serializer.serialize(urlParameter.mapper, urlParameterValue, getPathStringFromParameter(urlParameter));
                        if (!urlParameter.skipEncoding) {
                            urlParameterValue = encodeURIComponent(urlParameterValue);
                        }
                        requestUrl.replaceAll("{" + (urlParameter.mapper.serializedName || getPathStringFromParameter(urlParameter)) + "}", urlParameterValue);
                    }
                }
                if (operationSpec.queryParameters && operationSpec.queryParameters.length > 0) {
                    for (var _b = 0, _c = operationSpec.queryParameters; _b < _c.length; _b++) {
                        var queryParameter = _c[_b];
                        var queryParameterValue = getOperationArgumentValueFromParameter(this, operationArguments, queryParameter, operationSpec.serializer);
                        if (queryParameterValue != undefined) {
                            queryParameterValue = operationSpec.serializer.serialize(queryParameter.mapper, queryParameterValue, getPathStringFromParameter(queryParameter));
                            if (queryParameter.collectionFormat != undefined) {
                                if (queryParameter.collectionFormat === QueryCollectionFormat.Multi) {
                                    if (queryParameterValue.length === 0) {
                                        queryParameterValue = "";
                                    }
                                    else {
                                        for (var index in queryParameterValue) {
                                            var item = queryParameterValue[index];
                                            queryParameterValue[index] = item == undefined ? "" : item.toString();
                                        }
                                    }
                                }
                                else {
                                    queryParameterValue = queryParameterValue.join(queryParameter.collectionFormat);
                                }
                            }
                            if (!queryParameter.skipEncoding) {
                                if (Array.isArray(queryParameterValue)) {
                                    for (var index in queryParameterValue) {
                                        queryParameterValue[index] = encodeURIComponent(queryParameterValue[index]);
                                    }
                                }
                                else {
                                    queryParameterValue = encodeURIComponent(queryParameterValue);
                                }
                            }
                            requestUrl.setQueryParameter(queryParameter.mapper.serializedName || getPathStringFromParameter(queryParameter), queryParameterValue);
                        }
                    }
                }
                httpRequest.url = requestUrl.toString();
                var contentType = operationSpec.contentType || this.requestContentType;
                if (contentType) {
                    httpRequest.headers.set("Content-Type", contentType);
                }
                if (operationSpec.headerParameters) {
                    for (var _d = 0, _e = operationSpec.headerParameters; _d < _e.length; _d++) {
                        var headerParameter = _e[_d];
                        var headerValue = getOperationArgumentValueFromParameter(this, operationArguments, headerParameter, operationSpec.serializer);
                        if (headerValue != undefined) {
                            headerValue = operationSpec.serializer.serialize(headerParameter.mapper, headerValue, getPathStringFromParameter(headerParameter));
                            var headerCollectionPrefix = headerParameter.mapper.headerCollectionPrefix;
                            if (headerCollectionPrefix) {
                                for (var _f = 0, _g = Object.keys(headerValue); _f < _g.length; _f++) {
                                    var key = _g[_f];
                                    httpRequest.headers.set(headerCollectionPrefix + key, headerValue[key]);
                                }
                            }
                            else {
                                httpRequest.headers.set(headerParameter.mapper.serializedName || getPathStringFromParameter(headerParameter), headerValue);
                            }
                        }
                    }
                }
                var options = operationArguments.options;
                if (options) {
                    if (options.customHeaders) {
                        for (var customHeaderName in options.customHeaders) {
                            httpRequest.headers.set(customHeaderName, options.customHeaders[customHeaderName]);
                        }
                    }
                    if (options.abortSignal) {
                        httpRequest.abortSignal = options.abortSignal;
                    }
                    if (options.timeout) {
                        httpRequest.timeout = options.timeout;
                    }
                    if (options.onUploadProgress) {
                        httpRequest.onUploadProgress = options.onUploadProgress;
                    }
                    if (options.onDownloadProgress) {
                        httpRequest.onDownloadProgress = options.onDownloadProgress;
                    }
                }
                httpRequest.withCredentials = this._withCredentials;
                serializeRequestBody(this, httpRequest, operationArguments, operationSpec);
                if (httpRequest.streamResponseBody == undefined) {
                    httpRequest.streamResponseBody = isStreamOperation(operationSpec);
                }
                result = this.sendRequest(httpRequest)
                    .then(function (res) { return flattenResponse(res, operationSpec.responses[res.status]); });
            }
            catch (error) {
                result = Promise.reject(error);
            }
            var cb = callback;
            if (cb) {
                result
                    // tslint:disable-next-line:no-null-keyword
                    .then(function (res) { return cb(null, res._response.parsedBody, res._response.request, res._response); })
                    .catch(function (err) { return cb(err); });
            }
            return result;
        };
        return ServiceClient;
    }());
    function serializeRequestBody(serviceClient, httpRequest, operationArguments, operationSpec) {
        if (operationSpec.requestBody && operationSpec.requestBody.mapper) {
            httpRequest.body = getOperationArgumentValueFromParameter(serviceClient, operationArguments, operationSpec.requestBody, operationSpec.serializer);
            var bodyMapper = operationSpec.requestBody.mapper;
            var required = bodyMapper.required, xmlName = bodyMapper.xmlName, xmlElementName = bodyMapper.xmlElementName, serializedName = bodyMapper.serializedName;
            var typeName = bodyMapper.type.name;
            try {
                if (httpRequest.body != undefined || required) {
                    var requestBodyParameterPathString = getPathStringFromParameter(operationSpec.requestBody);
                    httpRequest.body = operationSpec.serializer.serialize(bodyMapper, httpRequest.body, requestBodyParameterPathString);
                    var isStream = typeName === MapperType.Stream;
                    if (operationSpec.isXML) {
                        if (typeName === MapperType.Sequence) {
                            httpRequest.body = stringifyXML(prepareXMLRootList(httpRequest.body, xmlElementName || xmlName || serializedName), { rootName: xmlName || serializedName });
                        }
                        else if (!isStream) {
                            httpRequest.body = stringifyXML(httpRequest.body, { rootName: xmlName || serializedName });
                        }
                    }
                    else if (!isStream) {
                        httpRequest.body = JSON.stringify(httpRequest.body);
                    }
                }
            }
            catch (error) {
                throw new Error("Error \"" + error.message + "\" occurred in serializing the payload - " + JSON.stringify(serializedName, undefined, "  ") + ".");
            }
        }
        else if (operationSpec.formDataParameters && operationSpec.formDataParameters.length > 0) {
            httpRequest.formData = {};
            for (var _i = 0, _a = operationSpec.formDataParameters; _i < _a.length; _i++) {
                var formDataParameter = _a[_i];
                var formDataParameterValue = getOperationArgumentValueFromParameter(serviceClient, operationArguments, formDataParameter, operationSpec.serializer);
                if (formDataParameterValue != undefined) {
                    var formDataParameterPropertyName = formDataParameter.mapper.serializedName || getPathStringFromParameter(formDataParameter);
                    httpRequest.formData[formDataParameterPropertyName] = operationSpec.serializer.serialize(formDataParameter.mapper, formDataParameterValue, getPathStringFromParameter(formDataParameter));
                }
            }
        }
    }
    function isRequestPolicyFactory(instance) {
        return typeof instance.create === "function";
    }
    function getValueOrFunctionResult(value, defaultValueCreator) {
        var result;
        if (typeof value === "string") {
            result = value;
        }
        else {
            result = defaultValueCreator();
            if (typeof value === "function") {
                result = value(result);
            }
        }
        return result;
    }
    function createDefaultRequestPolicyFactories(credentials, options) {
        var factories = [];
        if (options.generateClientRequestIdHeader) {
            factories.push(generateClientRequestIdPolicy(options.clientRequestIdHeaderName));
        }
        if (credentials) {
            if (isRequestPolicyFactory(credentials)) {
                factories.push(credentials);
            }
            else {
                factories.push(signingPolicy(credentials));
            }
        }
        var userAgentHeaderName = getValueOrFunctionResult(options.userAgentHeaderName, getDefaultUserAgentHeaderName);
        var userAgentHeaderValue = getValueOrFunctionResult(options.userAgent, getDefaultUserAgentValue);
        if (userAgentHeaderName && userAgentHeaderValue) {
            factories.push(userAgentPolicy({ key: userAgentHeaderName, value: userAgentHeaderValue }));
        }
        factories.push(redirectPolicy());
        factories.push(rpRegistrationPolicy(options.rpRegistrationRetryTimeout));
        if (!options.noRetryPolicy) {
            factories.push(exponentialRetryPolicy());
            factories.push(systemErrorRetryPolicy());
            factories.push(throttlingRetryPolicy());
        }
        factories.push(deserializationPolicy(options.deserializationContentTypes));
        var proxySettings = options.proxySettings || getDefaultProxySettings();
        if (proxySettings) {
            factories.push(proxyPolicy(proxySettings));
        }
        return factories;
    }
    function getOperationArgumentValueFromParameter(serviceClient, operationArguments, parameter, serializer) {
        return getOperationArgumentValueFromParameterPath(serviceClient, operationArguments, parameter.parameterPath, parameter.mapper, serializer);
    }
    function getOperationArgumentValueFromParameterPath(serviceClient, operationArguments, parameterPath, parameterMapper, serializer) {
        var value;
        if (typeof parameterPath === "string") {
            parameterPath = [parameterPath];
        }
        if (Array.isArray(parameterPath)) {
            if (parameterPath.length > 0) {
                if (parameterMapper.isConstant) {
                    value = parameterMapper.defaultValue;
                }
                else {
                    var propertySearchResult = getPropertyFromParameterPath(operationArguments, parameterPath);
                    if (!propertySearchResult.propertyFound) {
                        propertySearchResult = getPropertyFromParameterPath(serviceClient, parameterPath);
                    }
                    var useDefaultValue = false;
                    if (!propertySearchResult.propertyFound) {
                        useDefaultValue = parameterMapper.required || (parameterPath[0] === "options" && parameterPath.length === 2);
                    }
                    value = useDefaultValue ? parameterMapper.defaultValue : propertySearchResult.propertyValue;
                }
                // Serialize just for validation purposes.
                var parameterPathString = getPathStringFromParameterPath(parameterPath, parameterMapper);
                serializer.serialize(parameterMapper, value, parameterPathString);
            }
        }
        else {
            if (parameterMapper.required) {
                value = {};
            }
            for (var propertyName in parameterPath) {
                var propertyMapper = parameterMapper.type.modelProperties[propertyName];
                var propertyPath = parameterPath[propertyName];
                var propertyValue = getOperationArgumentValueFromParameterPath(serviceClient, operationArguments, propertyPath, propertyMapper, serializer);
                // Serialize just for validation purposes.
                var propertyPathString = getPathStringFromParameterPath(propertyPath, propertyMapper);
                serializer.serialize(propertyMapper, propertyValue, propertyPathString);
                if (propertyValue !== undefined) {
                    if (!value) {
                        value = {};
                    }
                    value[propertyName] = propertyValue;
                }
            }
        }
        return value;
    }
    function getPropertyFromParameterPath(parent, parameterPath) {
        var result = { propertyFound: false };
        var i = 0;
        for (; i < parameterPath.length; ++i) {
            var parameterPathPart = parameterPath[i];
            // Make sure to check inherited properties too, so don't use hasOwnProperty().
            if (parent != undefined && parameterPathPart in parent) {
                parent = parent[parameterPathPart];
            }
            else {
                break;
            }
        }
        if (i === parameterPath.length) {
            result.propertyValue = parent;
            result.propertyFound = true;
        }
        return result;
    }
    function flattenResponse(_response, responseSpec) {
        var parsedHeaders = _response.parsedHeaders;
        var bodyMapper = responseSpec && responseSpec.bodyMapper;
        var addOperationResponse = function (obj) {
            return Object.defineProperty(obj, "_response", {
                value: _response
            });
        };
        if (bodyMapper) {
            var typeName = bodyMapper.type.name;
            if (typeName === "Stream") {
                return addOperationResponse(__assign({}, parsedHeaders, { blobBody: _response.blobBody, readableStreamBody: _response.readableStreamBody }));
            }
            var modelProperties_1 = typeName === "Composite" && bodyMapper.type.modelProperties || {};
            var isPageableResponse = Object.keys(modelProperties_1).some(function (k) { return modelProperties_1[k].serializedName === ""; });
            if (typeName === "Sequence" || isPageableResponse) {
                var arrayResponse = (_response.parsedBody || []).slice();
                for (var _i = 0, _a = Object.keys(modelProperties_1); _i < _a.length; _i++) {
                    var key = _a[_i];
                    if (modelProperties_1[key].serializedName) {
                        arrayResponse[key] = _response.parsedBody[key];
                    }
                }
                if (parsedHeaders) {
                    for (var _b = 0, _c = Object.keys(parsedHeaders); _b < _c.length; _b++) {
                        var key = _c[_b];
                        arrayResponse[key] = parsedHeaders[key];
                    }
                }
                addOperationResponse(arrayResponse);
                return arrayResponse;
            }
            if (typeName === "Composite" || typeName === "Dictionary") {
                return addOperationResponse(__assign({}, parsedHeaders, _response.parsedBody));
            }
        }
        if (bodyMapper || _response.request.method === "HEAD") {
            // primitive body types and HEAD booleans
            return addOperationResponse(__assign({}, parsedHeaders, { body: _response.parsedBody }));
        }
        return addOperationResponse(__assign({}, parsedHeaders, _response.parsedBody));
    }

    /*
     * Code generated by Microsoft (R) AutoRest Code Generator.
     * Changes may cause incorrect behavior and will be lost if the code is regenerated.
     */
    /**
     * Defines values for EntityType.
     * Possible values include: 'Country', 'CountrySubdivision', 'CountrySecondarySubdivision',
     * 'CountryTertiarySubdivision', 'Municipality', 'MunicipalitySubdivision', 'Neighbourhood',
     * 'PostalCodeArea'
     * @readonly
     * @enum {string}
     */
    var EntityType;
    (function (EntityType) {
        /**
         * Country name
         */
        EntityType["Country"] = "Country";
        /**
         * State or Province
         */
        EntityType["CountrySubdivision"] = "CountrySubdivision";
        /**
         * County
         */
        EntityType["CountrySecondarySubdivision"] = "CountrySecondarySubdivision";
        /**
         * Named Area
         */
        EntityType["CountryTertiarySubdivision"] = "CountryTertiarySubdivision";
        /**
         * City / Town
         */
        EntityType["Municipality"] = "Municipality";
        /**
         * Sub / Super City
         */
        EntityType["MunicipalitySubdivision"] = "MunicipalitySubdivision";
        /**
         * Neighbourhood
         */
        EntityType["Neighbourhood"] = "Neighbourhood";
        /**
         * Postal Code / Zip Code
         */
        EntityType["PostalCodeArea"] = "PostalCodeArea";
    })(EntityType || (EntityType = {}));
    /**
     * Defines values for MagnitudeOfDelay.
     * Possible values include: '0', '1', '2', '3', '4'
     * @readonly
     * @enum {string}
     */
    var MagnitudeOfDelay;
    (function (MagnitudeOfDelay) {
        /**
         * Unknown.
         */
        MagnitudeOfDelay["Zero"] = "0";
        /**
         * Minor.
         */
        MagnitudeOfDelay["One"] = "1";
        /**
         * Moderate.
         */
        MagnitudeOfDelay["Two"] = "2";
        /**
         * Major.
         */
        MagnitudeOfDelay["Three"] = "3";
        /**
         * Undefined, used for road closures and other indefinite delays.
         */
        MagnitudeOfDelay["Four"] = "4";
    })(MagnitudeOfDelay || (MagnitudeOfDelay = {}));
    /**
     * Defines values for GuidanceInstructionType.
     * Possible values include: 'TURN', 'ROAD_CHANGE', 'LOCATION_DEPARTURE', 'LOCATION_ARRIVAL',
     * 'DIRECTION_INFO', 'LOCATION_WAYPOINT'
     * @readonly
     * @enum {string}
     */
    var GuidanceInstructionType;
    (function (GuidanceInstructionType) {
        /**
         * Turn.
         */
        GuidanceInstructionType["TURN"] = "TURN";
        /**
         * Road Change.
         */
        GuidanceInstructionType["ROADCHANGE"] = "ROAD_CHANGE";
        /**
         * Departure location.
         */
        GuidanceInstructionType["LOCATIONDEPARTURE"] = "LOCATION_DEPARTURE";
        /**
         * Arrival location.
         */
        GuidanceInstructionType["LOCATIONARRIVAL"] = "LOCATION_ARRIVAL";
        /**
         * Direction information.
         */
        GuidanceInstructionType["DIRECTIONINFO"] = "DIRECTION_INFO";
        /**
         * Way point location.
         */
        GuidanceInstructionType["LOCATIONWAYPOINT"] = "LOCATION_WAYPOINT";
    })(GuidanceInstructionType || (GuidanceInstructionType = {}));
    /**
     * Defines values for DrivingSide.
     * Possible values include: 'LEFT', 'RIGHT'
     * @readonly
     * @enum {string}
     */
    var DrivingSide;
    (function (DrivingSide) {
        /**
         * Left side.
         */
        DrivingSide["LEFT"] = "LEFT";
        /**
         * Right side.
         */
        DrivingSide["RIGHT"] = "RIGHT";
    })(DrivingSide || (DrivingSide = {}));
    /**
     * Defines values for GuidanceManeuver.
     * Possible values include: 'ARRIVE', 'ARRIVE_LEFT', 'ARRIVE_RIGHT', 'DEPART', 'STRAIGHT',
     * 'KEEP_RIGHT', 'BEAR_RIGHT', 'TURN_RIGHT', 'SHARP_RIGHT', 'KEEP_LEFT', 'BEAR_LEFT', 'TURN_LEFT',
     * 'SHARP_LEFT', 'MAKE_UTURN', 'ENTER_MOTORWAY', 'ENTER_FREEWAY', 'ENTER_HIGHWAY', 'TAKE_EXIT',
     * 'MOTORWAY_EXIT_LEFT', 'MOTORWAY_EXIT_RIGHT', 'TAKE_FERRY', 'ROUNDABOUT_CROSS',
     * 'ROUNDABOUT_RIGHT', 'ROUNDABOUT_LEFT', 'ROUNDABOUT_BACK', 'TRY_MAKE_UTURN', 'FOLLOW',
     * 'SWITCH_PARALLEL_ROAD', 'SWITCH_MAIN_ROAD', 'ENTRANCE_RAMP', 'WAYPOINT_LEFT', 'WAYPOINT_RIGHT',
     * 'WAYPOINT_REACHED'
     * @readonly
     * @enum {string}
     */
    var GuidanceManeuver;
    (function (GuidanceManeuver) {
        /**
         * You have arrived.
         */
        GuidanceManeuver["ARRIVE"] = "ARRIVE";
        /**
         * You have arrived. Your destination is on the left.
         */
        GuidanceManeuver["ARRIVELEFT"] = "ARRIVE_LEFT";
        /**
         * You have arrived. Your destination is on the right.
         */
        GuidanceManeuver["ARRIVERIGHT"] = "ARRIVE_RIGHT";
        /**
         * Leave.
         */
        GuidanceManeuver["DEPART"] = "DEPART";
        /**
         * Keep straight on.
         */
        GuidanceManeuver["STRAIGHT"] = "STRAIGHT";
        /**
         * Keep right.
         */
        GuidanceManeuver["KEEPRIGHT"] = "KEEP_RIGHT";
        /**
         * Bear right.
         */
        GuidanceManeuver["BEARRIGHT"] = "BEAR_RIGHT";
        /**
         * Turn right.
         */
        GuidanceManeuver["TURNRIGHT"] = "TURN_RIGHT";
        /**
         * Turn sharp right.
         */
        GuidanceManeuver["SHARPRIGHT"] = "SHARP_RIGHT";
        /**
         * Keep left.
         */
        GuidanceManeuver["KEEPLEFT"] = "KEEP_LEFT";
        /**
         * Bear left.
         */
        GuidanceManeuver["BEARLEFT"] = "BEAR_LEFT";
        /**
         * Turn left.
         */
        GuidanceManeuver["TURNLEFT"] = "TURN_LEFT";
        /**
         * Turn sharp left.
         */
        GuidanceManeuver["SHARPLEFT"] = "SHARP_LEFT";
        /**
         * Make a U-turn.
         */
        GuidanceManeuver["MAKEUTURN"] = "MAKE_UTURN";
        /**
         * Take the motorway.
         */
        GuidanceManeuver["ENTERMOTORWAY"] = "ENTER_MOTORWAY";
        /**
         * Take the freeway.
         */
        GuidanceManeuver["ENTERFREEWAY"] = "ENTER_FREEWAY";
        /**
         * Take the highway.
         */
        GuidanceManeuver["ENTERHIGHWAY"] = "ENTER_HIGHWAY";
        /**
         * Take the exit.
         */
        GuidanceManeuver["TAKEEXIT"] = "TAKE_EXIT";
        /**
         * Take the left exit.
         */
        GuidanceManeuver["MOTORWAYEXITLEFT"] = "MOTORWAY_EXIT_LEFT";
        /**
         * Take the right exit.
         */
        GuidanceManeuver["MOTORWAYEXITRIGHT"] = "MOTORWAY_EXIT_RIGHT";
        /**
         * Take the ferry.
         */
        GuidanceManeuver["TAKEFERRY"] = "TAKE_FERRY";
        /**
         * Cross the roundabout.
         */
        GuidanceManeuver["ROUNDABOUTCROSS"] = "ROUNDABOUT_CROSS";
        /**
         * At the roundabout take the exit on the right.
         */
        GuidanceManeuver["ROUNDABOUTRIGHT"] = "ROUNDABOUT_RIGHT";
        /**
         * At the roundabout take the exit on the left.
         */
        GuidanceManeuver["ROUNDABOUTLEFT"] = "ROUNDABOUT_LEFT";
        /**
         * Go around the roundabout.
         */
        GuidanceManeuver["ROUNDABOUTBACK"] = "ROUNDABOUT_BACK";
        /**
         * Try to make a U-turn.
         */
        GuidanceManeuver["TRYMAKEUTURN"] = "TRY_MAKE_UTURN";
        /**
         * Follow.
         */
        GuidanceManeuver["FOLLOW"] = "FOLLOW";
        /**
         * Switch to the parallel road.
         */
        GuidanceManeuver["SWITCHPARALLELROAD"] = "SWITCH_PARALLEL_ROAD";
        /**
         * Switch to the main road.
         */
        GuidanceManeuver["SWITCHMAINROAD"] = "SWITCH_MAIN_ROAD";
        /**
         * Take the ramp.
         */
        GuidanceManeuver["ENTRANCERAMP"] = "ENTRANCE_RAMP";
        /**
         * You have reached the waypoint. It is on the left.
         */
        GuidanceManeuver["WAYPOINTLEFT"] = "WAYPOINT_LEFT";
        /**
         * You have reached the waypoint. It is on the right.
         */
        GuidanceManeuver["WAYPOINTRIGHT"] = "WAYPOINT_RIGHT";
        /**
         * You have reached the waypoint.
         */
        GuidanceManeuver["WAYPOINTREACHED"] = "WAYPOINT_REACHED";
    })(GuidanceManeuver || (GuidanceManeuver = {}));
    /**
     * Defines values for TransitType.
     * Possible values include: 'Bus', 'CableCar', 'Ferry', 'Funicular', 'Gondola', 'Rail', 'Tram',
     * 'Subway'
     * @readonly
     * @enum {string}
     */
    var TransitType;
    (function (TransitType) {
        /**
         * bus
         */
        TransitType["Bus"] = "Bus";
        /**
         * cableCar
         */
        TransitType["CableCar"] = "CableCar";
        /**
         * ferry
         */
        TransitType["Ferry"] = "Ferry";
        /**
         * funicular
         */
        TransitType["Funicular"] = "Funicular";
        /**
         * gondola
         */
        TransitType["Gondola"] = "Gondola";
        /**
         * rail
         */
        TransitType["Rail"] = "Rail";
        /**
         * tram
         */
        TransitType["Tram"] = "Tram";
        /**
         * subway
         */
        TransitType["Subway"] = "Subway";
    })(TransitType || (TransitType = {}));
    /**
     * Defines values for LegType.
     * Possible values include: 'Walk', 'Bicycle', 'Tram', 'Subway', 'Rail', 'Bus', 'Ferry', 'Cable',
     * 'Gondola', 'Funicular', 'PathWayWalk', 'Wait', 'WaitOnVehicle'
     * @readonly
     * @enum {string}
     */
    var LegType;
    (function (LegType) {
        /**
         * Pedestrian walk
         */
        LegType["Walk"] = "Walk";
        /**
         * Bicycle
         */
        LegType["Bicycle"] = "Bicycle";
        /**
         * Tram
         */
        LegType["Tram"] = "Tram";
        /**
         * Subway
         */
        LegType["Subway"] = "Subway";
        /**
         * Rail
         */
        LegType["Rail"] = "Rail";
        /**
         * Bus
         */
        LegType["Bus"] = "Bus";
        /**
         * Ferry
         */
        LegType["Ferry"] = "Ferry";
        /**
         * Cable Car
         */
        LegType["Cable"] = "Cable";
        /**
         * Gondola
         */
        LegType["Gondola"] = "Gondola";
        /**
         * Funicular
         */
        LegType["Funicular"] = "Funicular";
        /**
         * A Leg describing a walk within a compound, e.g. Central Station
         */
        LegType["PathWayWalk"] = "PathWayWalk";
        /**
         * A Leg describing a wait for the next public transit leg
         */
        LegType["Wait"] = "Wait";
        /**
         * It’s necessary to wait for the next leg on the same vehicle (i.e. the bus will only change its
         * line number)
         */
        LegType["WaitOnVehicle"] = "WaitOnVehicle";
    })(LegType || (LegType = {}));
    /**
     * Defines values for RelativeDirection.
     * Possible values include: 'depart', 'hardLeft', 'left', 'slightlyLeft', 'continue',
     * 'slightlyRight', 'right', 'hardRight', 'circleClockwise', 'circleCounterclockwise', 'elevator',
     * 'uturnLeft', 'uturnRight'
     * @readonly
     * @enum {string}
     */
    var RelativeDirection;
    (function (RelativeDirection) {
        /**
         * Leave
         */
        RelativeDirection["Depart"] = "depart";
        /**
         * Turn sharp left.
         */
        RelativeDirection["HardLeft"] = "hardLeft";
        /**
         * Turn left.
         */
        RelativeDirection["Left"] = "left";
        /**
         * Turn slightly left.
         */
        RelativeDirection["SlightlyLeft"] = "slightlyLeft";
        /**
         * Keep going.
         */
        RelativeDirection["Continue"] = "continue";
        /**
         * Turn slightly right.
         */
        RelativeDirection["SlightlyRight"] = "slightlyRight";
        /**
         * Turn right.
         */
        RelativeDirection["Right"] = "right";
        /**
         * Turn sharp right.
         */
        RelativeDirection["HardRight"] = "hardRight";
        /**
         * Circle clockwise.
         */
        RelativeDirection["CircleClockwise"] = "circleClockwise";
        /**
         * Circle counter clockwise.
         */
        RelativeDirection["CircleCounterclockwise"] = "circleCounterclockwise";
        /**
         * Take the elevator.
         */
        RelativeDirection["Elevator"] = "elevator";
        /**
         * Make a U-turn left.
         */
        RelativeDirection["UturnLeft"] = "uturnLeft";
        /**
         * Make a U-turn right.
         */
        RelativeDirection["UturnRight"] = "uturnRight";
    })(RelativeDirection || (RelativeDirection = {}));
    /**
     * Defines values for AbsoluteDirection.
     * Possible values include: 'north', 'northeast', 'east', 'southeast', 'south', 'southwest',
     * 'west', 'northwest'
     * @readonly
     * @enum {string}
     */
    var AbsoluteDirection;
    (function (AbsoluteDirection) {
        /**
         * North
         */
        AbsoluteDirection["North"] = "north";
        /**
         * NorthEast
         */
        AbsoluteDirection["Northeast"] = "northeast";
        /**
         * East
         */
        AbsoluteDirection["East"] = "east";
        /**
         * SouthEast
         */
        AbsoluteDirection["Southeast"] = "southeast";
        /**
         * South
         */
        AbsoluteDirection["South"] = "south";
        /**
         * SouthWest
         */
        AbsoluteDirection["Southwest"] = "southwest";
        /**
         * West
         */
        AbsoluteDirection["West"] = "west";
        /**
         * NorthWest
         */
        AbsoluteDirection["Northwest"] = "northwest";
    })(AbsoluteDirection || (AbsoluteDirection = {}));
    /**
     * Defines values for ScheduleType.
     * Possible values include: 'scheduledTime', 'realTime'
     * @readonly
     * @enum {string}
     */
    var ScheduleType;
    (function (ScheduleType) {
        /**
         * Returned when estimated time of arrival is based on real-time data.
         */
        ScheduleType["ScheduledTime"] = "scheduledTime";
        /**
         * Returned when estimated time of arrival is based on static data.
         */
        ScheduleType["RealTime"] = "realTime";
    })(ScheduleType || (ScheduleType = {}));
    /**
     * Defines values for SearchIndexSet.
     * Possible values include: 'Addr', 'Geo', 'PAD', 'POI', 'Str', 'Xstr'
     * @readonly
     * @enum {string}
     */
    var SearchIndexSet;
    (function (SearchIndexSet) {
        /**
         * Address range interpolation
         */
        SearchIndexSet["Addr"] = "Addr";
        /**
         * Geographies
         */
        SearchIndexSet["Geo"] = "Geo";
        /**
         * Point Addresses
         */
        SearchIndexSet["PAD"] = "PAD";
        /**
         * Points of interest
         */
        SearchIndexSet["POI"] = "POI";
        /**
         * Streets
         */
        SearchIndexSet["Str"] = "Str";
        /**
         * Cross Streets (Intersections)
         */
        SearchIndexSet["Xstr"] = "Xstr";
    })(SearchIndexSet || (SearchIndexSet = {}));
    /**
     * Defines values for ConnectorSet.
     * Possible values include: 'StandardHouseholdCountrySpecific', 'IEC62196Type1',
     * 'IEC62196Type1CCS', 'IEC62196Type2CableAttached', 'IEC62196Type2Outlet', 'IEC62196Type2CCS',
     * 'IEC62196Type3', 'Chademo', 'IEC60309AC1PhaseBlue', 'IEC60309DCWhite', 'Tesla'
     * @readonly
     * @enum {string}
     */
    var ConnectorSet;
    (function (ConnectorSet) {
        /**
         * These are the standard household connectors for a certain region. They are all AC single phase
         * and the standard Voltage and standard Amperage.
         *
         * See also: [Plug & socket types - World
         * Standards](https://www.worldstandards.eu/electricity/plugs-and-sockets)
         */
        ConnectorSet["StandardHouseholdCountrySpecific"] = "StandardHouseholdCountrySpecific";
        /**
         * Type 1 connector as defined in the IEC 62196-2 standard. Also called Yazaki after the original
         * manufacturer or SAE J1772 after the standard that first published it. Mostly used in
         * combination with 120V single phase or up to 240V single phase infrastructure.
         */
        ConnectorSet["IEC62196Type1"] = "IEC62196Type1";
        /**
         * Type 1 based combo connector as defined in the IEC 62196-3 standard. The connector is based on
         * the Type 1 connector – as defined in the IEC 62196-2 standard – with two additional direct
         * current (DC) contacts to allow DC fast charging.
         */
        ConnectorSet["IEC62196Type1CCS"] = "IEC62196Type1CCS";
        /**
         * Type 2 connector as defined in the IEC 62196-2 standard. Provided as a cable and plug attached
         * to the charging point
         */
        ConnectorSet["IEC62196Type2CableAttached"] = "IEC62196Type2CableAttached";
        /**
         * Type 2 connector as defined in the IEC 62196-2 standard. Provided as a socket set into the
         * charging point.
         */
        ConnectorSet["IEC62196Type2Outlet"] = "IEC62196Type2Outlet";
        /**
         * Type 2 based combo connector as defined in the IEC 62196-3 standard. The connector is based on
         * the Type 2 connector – as defined in the IEC 62196-2 standard – with two additional direct
         * current (DC) contacts to allow DC fast charging.
         */
        ConnectorSet["IEC62196Type2CCS"] = "IEC62196Type2CCS";
        /**
         * Type 3 connector as defined in the IEC 62196-2 standard. Also called Scame after the original
         * manufacturer. Mostly used in combination with up to 240V single phase or up to 420V three
         * phase infrastructure.
         */
        ConnectorSet["IEC62196Type3"] = "IEC62196Type3";
        /**
         * CHAdeMO connector named after an association formed by the Tokyo Electric Power Company and
         * industrial partners. Because of this is is also known as the TEPCO's connector. It supports
         * fast DC charging.
         */
        ConnectorSet["Chademo"] = "Chademo";
        /**
         * Industrial Blue connector is a connector defined in the IEC 60309 standard. It is sometime
         * referred to as by some combination of the standard, the color and the fact that is a single
         * phase connector. The connector usually has the "P+N+E, 6h" configuration.
         */
        ConnectorSet["IEC60309AC1PhaseBlue"] = "IEC60309AC1PhaseBlue";
        /**
         * Industrial White connector is a DC connector defined in the IEC 60309 standard.
         */
        ConnectorSet["IEC60309DCWhite"] = "IEC60309DCWhite";
        /**
         * The Tesla connector is the regionally specific Tesla Supercharger connector. I.e. it refers to
         * either Tesla's proprietary connector, sometimes referred to as Tesla Port mostly limited to
         * North America or the modified Type 2 (DC over Type 2) in Europe.
         */
        ConnectorSet["Tesla"] = "Tesla";
    })(ConnectorSet || (ConnectorSet = {}));
    /**
     * Defines values for OpeningHours.
     * Possible values include: 'nextSevenDays'
     * @readonly
     * @enum {string}
     */
    var OpeningHours;
    (function (OpeningHours) {
        /**
         * Shows the opening hours for next week, starting with the current day in the local time of the
         * POI.
         */
        OpeningHours["NextSevenDays"] = "nextSevenDays";
    })(OpeningHours || (OpeningHours = {}));
    /**
     * Defines values for VehicleLoadType.
     * Possible values include: 'USHazmatClass1', 'USHazmatClass2', 'USHazmatClass3', 'USHazmatClass4',
     * 'USHazmatClass5', 'USHazmatClass6', 'USHazmatClass7', 'USHazmatClass8', 'USHazmatClass9',
     * 'otherHazmatExplosive', 'otherHazmatGeneral', 'otherHazmatHarmfulToWater'
     * @readonly
     * @enum {string}
     */
    var VehicleLoadType;
    (function (VehicleLoadType) {
        /**
         * Explosives
         */
        VehicleLoadType["USHazmatClass1"] = "USHazmatClass1";
        /**
         * Compressed gas
         */
        VehicleLoadType["USHazmatClass2"] = "USHazmatClass2";
        /**
         * Flammable liquids
         */
        VehicleLoadType["USHazmatClass3"] = "USHazmatClass3";
        /**
         * Flammable solids
         */
        VehicleLoadType["USHazmatClass4"] = "USHazmatClass4";
        /**
         * Oxidizers
         */
        VehicleLoadType["USHazmatClass5"] = "USHazmatClass5";
        /**
         * Poisons
         */
        VehicleLoadType["USHazmatClass6"] = "USHazmatClass6";
        /**
         * Radioactive
         */
        VehicleLoadType["USHazmatClass7"] = "USHazmatClass7";
        /**
         * Corrosives
         */
        VehicleLoadType["USHazmatClass8"] = "USHazmatClass8";
        /**
         * Miscellaneous
         */
        VehicleLoadType["USHazmatClass9"] = "USHazmatClass9";
        /**
         * Explosives
         */
        VehicleLoadType["OtherHazmatExplosive"] = "otherHazmatExplosive";
        /**
         * Miscellaneous
         */
        VehicleLoadType["OtherHazmatGeneral"] = "otherHazmatGeneral";
        /**
         * Harmful to water
         */
        VehicleLoadType["OtherHazmatHarmfulToWater"] = "otherHazmatHarmfulToWater";
    })(VehicleLoadType || (VehicleLoadType = {}));
    /**
     * Defines values for RouteType.
     * Possible values include: 'fastest', 'shortest', 'eco', 'thrilling'
     * @readonly
     * @enum {string}
     */
    var RouteType;
    (function (RouteType) {
        /**
         * The fastest route.
         */
        RouteType["Fastest"] = "fastest";
        /**
         * The shortest route by distance.
         */
        RouteType["Shortest"] = "shortest";
        /**
         * A route balanced by economy and speed.
         */
        RouteType["Eco"] = "eco";
        /**
         * Includes interesting or challenging roads and uses as few motorways as possible. You can
         * choose the level of turns included and also the degree of hilliness. See the hilliness and
         * windingness parameters for how to set this. There is a limit of 900 km on routes planned with
         * routeType=thrilling
         */
        RouteType["Thrilling"] = "thrilling";
    })(RouteType || (RouteType = {}));
    /**
     * Defines values for Windingness.
     * Possible values include: 'low', 'normal', 'high'
     * @readonly
     * @enum {string}
     */
    var Windingness;
    (function (Windingness) {
        /**
         * low
         */
        Windingness["Low"] = "low";
        /**
         * normal
         */
        Windingness["Normal"] = "normal";
        /**
         * high
         */
        Windingness["High"] = "high";
    })(Windingness || (Windingness = {}));
    /**
     * Defines values for Hilliness.
     * Possible values include: 'low', 'normal', 'high'
     * @readonly
     * @enum {string}
     */
    var Hilliness;
    (function (Hilliness) {
        /**
         * low
         */
        Hilliness["Low"] = "low";
        /**
         * normal
         */
        Hilliness["Normal"] = "normal";
        /**
         * high
         */
        Hilliness["High"] = "high";
    })(Hilliness || (Hilliness = {}));
    /**
     * Defines values for TravelMode.
     * Possible values include: 'car', 'truck', 'taxi', 'bus', 'van', 'motorcycle', 'bicycle',
     * 'pedestrian'
     * @readonly
     * @enum {string}
     */
    var TravelMode;
    (function (TravelMode) {
        /**
         * car
         */
        TravelMode["Car"] = "car";
        /**
         * truck
         */
        TravelMode["Truck"] = "truck";
        /**
         * taxi
         */
        TravelMode["Taxi"] = "taxi";
        /**
         * bus
         */
        TravelMode["Bus"] = "bus";
        /**
         * van
         */
        TravelMode["Van"] = "van";
        /**
         * motorcycle
         */
        TravelMode["Motorcycle"] = "motorcycle";
        /**
         * bicycle
         */
        TravelMode["Bicycle"] = "bicycle";
        /**
         * pedestrian
         */
        TravelMode["Pedestrian"] = "pedestrian";
    })(TravelMode || (TravelMode = {}));
    /**
     * Defines values for Avoid.
     * Possible values include: 'tollRoads', 'motorways', 'ferries', 'unpavedRoads', 'carpools',
     * 'alreadyUsedRoads', 'borderCrossings'
     * @readonly
     * @enum {string}
     */
    var Avoid;
    (function (Avoid) {
        /**
         * Avoids toll roads.
         */
        Avoid["TollRoads"] = "tollRoads";
        /**
         * Avoids motorways
         */
        Avoid["Motorways"] = "motorways";
        /**
         * Avoids ferries
         */
        Avoid["Ferries"] = "ferries";
        /**
         * Avoids unpaved roads
         */
        Avoid["UnpavedRoads"] = "unpavedRoads";
        /**
         * Avoids routes that require the use of carpool (HOV/High Occupancy Vehicle) lanes.
         */
        Avoid["Carpools"] = "carpools";
        /**
         * Avoids using the same road multiple times. Most useful in conjunction with
         * `routeType`=thrilling.
         */
        Avoid["AlreadyUsedRoads"] = "alreadyUsedRoads";
        /**
         * Avoids border crossings in route calculation.
         */
        Avoid["BorderCrossings"] = "borderCrossings";
    })(Avoid || (Avoid = {}));
    /**
     * Defines values for VehicleEngineType.
     * Possible values include: 'combustion', 'electric'
     * @readonly
     * @enum {string}
     */
    var VehicleEngineType;
    (function (VehicleEngineType) {
        /**
         * Internal combustion engine.
         */
        VehicleEngineType["Combustion"] = "combustion";
        /**
         * Electric engine.
         */
        VehicleEngineType["Electric"] = "electric";
    })(VehicleEngineType || (VehicleEngineType = {}));
    /**
     * Defines values for SectionType.
     * Possible values include: 'carTrain', 'country', 'ferry', 'motorway', 'pedestrian', 'tollRoad',
     * 'tollVignette', 'traffic', 'travelMode', 'tunnel'
     * @readonly
     * @enum {string}
     */
    var SectionType;
    (function (SectionType) {
        /**
         * Get sections if the route includes car trains.
         */
        SectionType["CarTrain"] = "carTrain";
        /**
         * Countries the route has parts in.
         */
        SectionType["Country"] = "country";
        /**
         * Get sections if the route includes ferries.
         */
        SectionType["Ferry"] = "ferry";
        /**
         * Get sections if the route includes motorways.
         */
        SectionType["Motorway"] = "motorway";
        /**
         * Get sections which are suited for pedestrians.
         */
        SectionType["Pedestrian"] = "pedestrian";
        /**
         * Get sections which require a toll to be payed.
         */
        SectionType["TollRoad"] = "tollRoad";
        /**
         * Get sections which require a toll vignette to be present.
         */
        SectionType["TollVignette"] = "tollVignette";
        /**
         * Get sections which contain traffic information.
         */
        SectionType["Traffic"] = "traffic";
        /**
         * Get sections in relation to the request parameter `travelMode`.
         */
        SectionType["TravelMode"] = "travelMode";
        /**
         * Get sections if the route includes tunnels.
         */
        SectionType["Tunnel"] = "tunnel";
    })(SectionType || (SectionType = {}));
    /**
     * Defines values for RouteRepresentation.
     * Possible values include: 'polyline', 'summaryOnly', 'none'
     * @readonly
     * @enum {string}
     */
    var RouteRepresentation;
    (function (RouteRepresentation) {
        /**
         * Includes route geometry in the response.
         */
        RouteRepresentation["Polyline"] = "polyline";
        /**
         * Summary as per polyline but excluding the point geometry elements for the routes in the
         * response.
         */
        RouteRepresentation["SummaryOnly"] = "summaryOnly";
        /**
         * Includes only the optimized waypoint indices but does not include the route geometry in the
         * response.
         */
        RouteRepresentation["None"] = "none";
    })(RouteRepresentation || (RouteRepresentation = {}));
    /**
     * Defines values for ComputeTravelTimeFor.
     * Possible values include: 'none', 'all'
     * @readonly
     * @enum {string}
     */
    var ComputeTravelTimeFor;
    (function (ComputeTravelTimeFor) {
        /**
         * Does not compute additional travel times.
         */
        ComputeTravelTimeFor["None"] = "none";
        /**
         * Computes travel times for all types of traffic information and specifies all results in the
         * fields noTrafficTravelTimeInSeconds, historicTrafficTravelTimeInSeconds and
         * liveTrafficIncidentsTravelTimeInSeconds being included in the summaries in the route response.
         */
        ComputeTravelTimeFor["All"] = "all";
    })(ComputeTravelTimeFor || (ComputeTravelTimeFor = {}));
    /**
     * Defines values for AlternativeRouteType.
     * Possible values include: 'anyRoute', 'betterRoute'
     * @readonly
     * @enum {string}
     */
    var AlternativeRouteType;
    (function (AlternativeRouteType) {
        /**
         * Allow any alternative route to be returned irrespective of how it compares to the reference
         * route in terms of optimality.
         */
        AlternativeRouteType["AnyRoute"] = "anyRoute";
        /**
         * Return an alternative route only if it is better than the reference route according to the
         * given planning criteria.
         */
        AlternativeRouteType["BetterRoute"] = "betterRoute";
    })(AlternativeRouteType || (AlternativeRouteType = {}));
    /**
     * Defines values for RouteInstructionsType.
     * Possible values include: 'coded', 'text', 'tagged'
     * @readonly
     * @enum {string}
     */
    var RouteInstructionsType;
    (function (RouteInstructionsType) {
        /**
         * Returns raw instruction data without human-readable messages.
         */
        RouteInstructionsType["Coded"] = "coded";
        /**
         * Returns raw instructions data with human-readable messages in plain text.
         */
        RouteInstructionsType["Text"] = "text";
        /**
         * Returns raw instruction data with tagged human-readable messages to permit formatting.
         */
        RouteInstructionsType["Tagged"] = "tagged";
    })(RouteInstructionsType || (RouteInstructionsType = {}));
    /**
     * Defines values for TimezoneOptions.
     * Possible values include: 'none', 'zoneInfo', 'transitions', 'all'
     * @readonly
     * @enum {string}
     */
    var TimezoneOptions;
    (function (TimezoneOptions) {
        /**
         * Do not include zoneinfo or transitions in the result.
         */
        TimezoneOptions["None"] = "none";
        /**
         * Include additional time zone info in the result.
         */
        TimezoneOptions["ZoneInfo"] = "zoneInfo";
        /**
         * Include transition information in the result (The number of transitions is currently capped at
         * 250).
         */
        TimezoneOptions["Transitions"] = "transitions";
        /**
         * Include both zoneinfo and transitions in the result.
         */
        TimezoneOptions["All"] = "all";
    })(TimezoneOptions || (TimezoneOptions = {}));
    /**
     * Defines values for TileFormat.
     * Possible values include: 'png', 'pbf'
     * @readonly
     * @enum {string}
     */
    var TileFormat;
    (function (TileFormat) {
        /**
         * An image in the png format. Supports zoom levels 0 through 18.
         */
        TileFormat["Png"] = "png";
        /**
         * Vector graphic in the pbf format. Supports zoom levels 0 through 22.
         */
        TileFormat["Pbf"] = "pbf";
    })(TileFormat || (TileFormat = {}));
    /**
     * Defines values for GeofenceMode.
     * Possible values include: 'All', 'EnterAndExit'
     * @readonly
     * @enum {string}
     */
    var GeofenceMode;
    (function (GeofenceMode) {
        /**
         * Publish all the query results to Azure Maps account event subscription.
         */
        GeofenceMode["All"] = "All";
        /**
         * Only publish result when user location is considered as crossing geofencing boarder.
         */
        GeofenceMode["EnterAndExit"] = "EnterAndExit";
    })(GeofenceMode || (GeofenceMode = {}));
    /**
     * Defines values for StaticMapLayer.
     * Possible values include: 'basic', 'hybrid', 'labels'
     * @readonly
     * @enum {string}
     */
    var StaticMapLayer;
    (function (StaticMapLayer) {
        /**
         * Returns an image containing all map features including polygons, borders, roads and labels.
         */
        StaticMapLayer["Basic"] = "basic";
        /**
         * Returns an image containing borders, roads, and labels, and can be overlaid on other tiles
         * (such as satellite imagery) to produce hybrid tiles.
         */
        StaticMapLayer["Hybrid"] = "hybrid";
        /**
         * Returns an image of just the map's label information.
         */
        StaticMapLayer["Labels"] = "labels";
    })(StaticMapLayer || (StaticMapLayer = {}));
    /**
     * Defines values for MapTileLayer.
     * Possible values include: 'basic', 'hybrid', 'labels', 'terra'
     * @readonly
     * @enum {string}
     */
    var MapTileLayer;
    (function (MapTileLayer) {
        /**
         * Returns a tile containing all map features including polygons, borders, roads and labels.
         */
        MapTileLayer["Basic"] = "basic";
        /**
         * Returns a tile containing borders, roads, and labels, and can be overlaid on other tiles (such
         * as satellite imagery) to produce hybrid tiles.
         */
        MapTileLayer["Hybrid"] = "hybrid";
        /**
         * Returns a tile of just the map's label information.
         */
        MapTileLayer["Labels"] = "labels";
        /**
         * Map canvas complete with shaded relief tiles. Zoom levels 0-6 (inclusive) are supported. Png
         * is the only supported TileFormat and only available MapTileSize is 512.
         */
        MapTileLayer["Terra"] = "terra";
    })(MapTileLayer || (MapTileLayer = {}));
    /**
     * Defines values for MapTileStyle.
     * Possible values include: 'main', 'shaded_relief'
     * @readonly
     * @enum {string}
     */
    var MapTileStyle;
    (function (MapTileStyle) {
        /**
         * Azure Maps main style
         */
        MapTileStyle["Main"] = "main";
        /**
         * Azure Maps main style completed with shaded relief. Supported by Layer terra.
         */
        MapTileStyle["ShadedRelief"] = "shaded_relief";
    })(MapTileStyle || (MapTileStyle = {}));
    /**
     * Defines values for MetroAreaQueryType.
     * Possible values include: 'position', 'countryCode'
     * @readonly
     * @enum {string}
     */
    var MetroAreaQueryType;
    (function (MetroAreaQueryType) {
        /**
         * The origin of the route as a comma separated string composed by latitude followed by longitude
         * e.g. "47.641268,-122.125679".
         */
        MetroAreaQueryType["Position"] = "position";
        /**
         * 2-character [ISO 3166-1](https://www.iso.org/iso-3166-country-codes.html) alpha-2 country
         * code. E.g. US.
         */
        MetroAreaQueryType["CountryCode"] = "countryCode";
    })(MetroAreaQueryType || (MetroAreaQueryType = {}));
    /**
     * Defines values for MetroAreaDetailType.
     * Possible values include: 'agencies', 'alerts', 'alertDetails', 'transitTypes'
     * @readonly
     * @enum {string}
     */
    var MetroAreaDetailType;
    (function (MetroAreaDetailType) {
        /**
         * Return a list of all public transit agencies operating in the given metro area.
         */
        MetroAreaDetailType["Agencies"] = "agencies";
        /**
         * Returns a list of all active service alerts, that are defined in the metro or agency level,
         * and are not connected to a specific line or stop.
         */
        MetroAreaDetailType["Alerts"] = "alerts";
        /**
         * Applicable only when alerts are requested. Returns details of the alerts.
         */
        MetroAreaDetailType["AlertDetails"] = "alertDetails";
        /**
         * Returns a list of all supported transit types in the given metro area.
         */
        MetroAreaDetailType["TransitTypes"] = "transitTypes";
    })(MetroAreaDetailType || (MetroAreaDetailType = {}));
    /**
     * Defines values for ObjectType.
     * Possible values include: 'stop', 'docklessBike', 'docklessElectricBike',
     * 'docklessElectricScooter', 'docklessScooter', 'docklessMoped', 'carShare', 'docklessVehicle',
     * 'bikeDock'
     * @readonly
     * @enum {string}
     */
    var ObjectType;
    (function (ObjectType) {
        /**
         * Stop
         */
        ObjectType["Stop"] = "stop";
        /**
         * Dockless bike
         */
        ObjectType["DocklessBike"] = "docklessBike";
        /**
         * Dockless electric bike
         */
        ObjectType["DocklessElectricBike"] = "docklessElectricBike";
        /**
         * Dockless electric scooter
         */
        ObjectType["DocklessElectricScooter"] = "docklessElectricScooter";
        /**
         * Dockless scooter
         */
        ObjectType["DocklessScooter"] = "docklessScooter";
        /**
         * Dockless moped
         */
        ObjectType["DocklessMoped"] = "docklessMoped";
        /**
         * Car Share
         */
        ObjectType["CarShare"] = "carShare";
        /**
         * Dockless Vehicle
         */
        ObjectType["DocklessVehicle"] = "docklessVehicle";
        /**
         * Docked Bike
         */
        ObjectType["BikeDock"] = "bikeDock";
    })(ObjectType || (ObjectType = {}));
    /**
     * Defines values for TransitLineDetailType.
     * Possible values include: 'alerts', 'alertDetails', 'lines', 'stops', 'schedule', 'patterns'
     * @readonly
     * @enum {string}
     */
    var TransitLineDetailType;
    (function (TransitLineDetailType) {
        /**
         * Return any active service alerts for the specified stop. Response provides brief information
         * for disruption in service and all basic data associated with the alert.
         */
        TransitLineDetailType["Alerts"] = "alerts";
        /**
         * Can only be used in conjunction with detailType=alerts.Return additional details associated
         * with the active service alerts.
         */
        TransitLineDetailType["AlertDetails"] = "alertDetails";
        /**
         * Return transit lines that stops at the specified stop.
         */
        TransitLineDetailType["Lines"] = "lines";
        /**
         * Return list of stops the line group goes through.
         */
        TransitLineDetailType["Stops"] = "stops";
        /**
         * Return a 24h static schedule for the specified line group from the current time of the day to
         * the end of the current day. Data is guaranteed to be returned only between the current day and
         * 3 days forward.
         */
        TransitLineDetailType["Schedule"] = "schedule";
        /**
         * Return list of patterns this group is comprised of. A pattern consists of a stop sequence and
         * shape per line.
         */
        TransitLineDetailType["Patterns"] = "patterns";
    })(TransitLineDetailType || (TransitLineDetailType = {}));
    /**
     * Defines values for TransitStopQueryType.
     * Possible values include: 'stopId', 'stopKey'
     * @readonly
     * @enum {string}
     */
    var TransitStopQueryType;
    (function (TransitStopQueryType) {
        /**
         * The unique Azure Maps identifier for the respective public transit stop. When referring stops
         * overtime, it is suggested to use stopId that will not change if the physical stop exists.
         */
        TransitStopQueryType["StopId"] = "stopId";
        /**
         * The GTFS stop Id. GTFS stop Ids are provided by the transit authority and are subject to
         * change.
         */
        TransitStopQueryType["StopKey"] = "stopKey";
    })(TransitStopQueryType || (TransitStopQueryType = {}));
    /**
     * Defines values for TransitStopDetailType.
     * Possible values include: 'alerts', 'alertDetails', 'lines', 'lineGroups'
     * @readonly
     * @enum {string}
     */
    var TransitStopDetailType;
    (function (TransitStopDetailType) {
        /**
         * Return any active service alerts for the specified stop. Response provides brief information
         * for disruption in service and all basic data associated with the alert.
         */
        TransitStopDetailType["Alerts"] = "alerts";
        /**
         * Can only be used in conjunction with detailType=alerts.Return additional details associated
         * with the active service alerts.
         */
        TransitStopDetailType["AlertDetails"] = "alertDetails";
        /**
         * Return transit lines that stops at the specified stop.
         */
        TransitStopDetailType["Lines"] = "lines";
        /**
         * Return line groups that stops at the specified stop.
         */
        TransitStopDetailType["LineGroups"] = "lineGroups";
    })(TransitStopDetailType || (TransitStopDetailType = {}));
    /**
     * Defines values for OriginType.
     * Possible values include: 'position', 'stopId', 'stopKey'
     * @readonly
     * @enum {string}
     */
    var OriginType;
    (function (OriginType) {
        /**
         * The origin of the route as a comma separated string composed by latitude followed by longitude
         * e.g. "47.641268,-122.125679".
         */
        OriginType["Position"] = "position";
        /**
         * The unique Azure Maps identifier for the respective public transit stop. When referring stops
         * overtime, it is suggested to use stopId that will not change if the physical stop exists.
         */
        OriginType["StopId"] = "stopId";
        /**
         * The GTFS stop Id. GTFS stop Ids are provided by the transit authority and are subject to
         * change.
         */
        OriginType["StopKey"] = "stopKey";
    })(OriginType || (OriginType = {}));
    /**
     * Defines values for DestinationType.
     * Possible values include: 'position', 'stopId', 'stopKey'
     * @readonly
     * @enum {string}
     */
    var DestinationType;
    (function (DestinationType) {
        /**
         * The destination of the route as a comma separated string composed by latitude followed by
         * longitude e.g. "47.641268,-122.125679".
         */
        DestinationType["Position"] = "position";
        /**
         * The unique Azure Maps identifier for the respective public transit stop. When referring stops
         * overtime, it is suggested to use stopId that will not change if the physical stop exists.
         */
        DestinationType["StopId"] = "stopId";
        /**
         * The GTFS stop Id. GTFS stop Ids are provided by the transit authority and are subject to
         * change.
         */
        DestinationType["StopKey"] = "stopKey";
    })(DestinationType || (DestinationType = {}));
    /**
     * Defines values for ModeType.
     * Possible values include: 'walk', 'bike', 'publicTransit'
     * @readonly
     * @enum {string}
     */
    var ModeType;
    (function (ModeType) {
        /**
         * walk (pedestrian)
         */
        ModeType["Walk"] = "walk";
        /**
         * bike
         */
        ModeType["Bike"] = "bike";
        /**
         * public transit
         */
        ModeType["PublicTransit"] = "publicTransit";
    })(ModeType || (ModeType = {}));
    /**
     * Defines values for TransitTypeFilter.
     * Possible values include: 'bus', 'cableCar', 'ferry', 'funicular', 'gondola', 'rail', 'tram',
     * 'subway'
     * @readonly
     * @enum {string}
     */
    var TransitTypeFilter;
    (function (TransitTypeFilter) {
        /**
         * bus
         */
        TransitTypeFilter["Bus"] = "bus";
        /**
         * cableCar
         */
        TransitTypeFilter["CableCar"] = "cableCar";
        /**
         * ferry
         */
        TransitTypeFilter["Ferry"] = "ferry";
        /**
         * funicular
         */
        TransitTypeFilter["Funicular"] = "funicular";
        /**
         * gondola
         */
        TransitTypeFilter["Gondola"] = "gondola";
        /**
         * rail
         */
        TransitTypeFilter["Rail"] = "rail";
        /**
         * tram
         */
        TransitTypeFilter["Tram"] = "tram";
        /**
         * subway
         */
        TransitTypeFilter["Subway"] = "subway";
    })(TransitTypeFilter || (TransitTypeFilter = {}));
    /**
     * Defines values for AgencyType.
     * Possible values include: 'agencyId', 'agencyKey', 'agencyName'
     * @readonly
     * @enum {string}
     */
    var AgencyType;
    (function (AgencyType) {
        /**
         * The Id of the transit agency, e.g. '5872'
         */
        AgencyType["AgencyId"] = "agencyId";
        /**
         * The agency’s GTFS Id.
         */
        AgencyType["AgencyKey"] = "agencyKey";
        /**
         * The name of the transit agency, e.g. Metro Transit.
         */
        AgencyType["AgencyName"] = "agencyName";
    })(AgencyType || (AgencyType = {}));
    /**
     * Defines values for TimeType.
     * Possible values include: 'arrival', 'departure', 'last'
     * @readonly
     * @enum {string}
     */
    var TimeType;
    (function (TimeType) {
        /**
         * arrival at the destination point. Requires that 'time' value must be in the future.
         */
        TimeType["Arrival"] = "arrival";
        /**
         * Request departure at the destination point. Requires that 'time' value must be now or in the
         * future.
         */
        TimeType["Departure"] = "departure";
        /**
         * Request the last lines for the day.
         */
        TimeType["Last"] = "last";
    })(TimeType || (TimeType = {}));
    /**
     * Defines values for TransitRouteType.
     * Possible values include: 'optimal', 'leastWalk', 'leastTransfers'
     * @readonly
     * @enum {string}
     */
    var TransitRouteType;
    (function (TransitRouteType) {
        /**
         * The best optimal route.
         */
        TransitRouteType["Optimal"] = "optimal";
        /**
         * Route with least walk.
         */
        TransitRouteType["LeastWalk"] = "leastWalk";
        /**
         * Route with least transfers.
         */
        TransitRouteType["LeastTransfers"] = "leastTransfers";
    })(TransitRouteType || (TransitRouteType = {}));
    /**
     * Defines values for BikeType.
     * Possible values include: 'privateBike', 'dockedBike'
     * @readonly
     * @enum {string}
     */
    var BikeType;
    (function (BikeType) {
        /**
         * Use private bike.
         */
        BikeType["PrivateBike"] = "privateBike";
        /**
         * Use docked bike share bike.
         */
        BikeType["DockedBike"] = "dockedBike";
    })(BikeType || (BikeType = {}));
    /**
     * Defines values for TransitItineraryDetailType.
     * Possible values include: 'geometry', 'schedule'
     * @readonly
     * @enum {string}
     */
    var TransitItineraryDetailType;
    (function (TransitItineraryDetailType) {
        /**
         * Shape of an in GeoJSON format. For public transit legs will return also the stops that the leg
         * passes through. For walk and bike legs, will return also the turn-by-turn navigation data.
         */
        TransitItineraryDetailType["Geometry"] = "geometry";
        /**
         * Static schedule data as to all departures of Public Transit legs from the current time of the
         * day to the end of the current day. Data is guaranteed to be returned only between the current
         * day and 3 days forward.
         */
        TransitItineraryDetailType["Schedule"] = "schedule";
    })(TransitItineraryDetailType || (TransitItineraryDetailType = {}));
    /**
     * Defines values for RealTimeArrivalsQueryType.
     * Possible values include: 'stops', 'line', 'lineAndStop', 'position'
     * @readonly
     * @enum {string}
     */
    var RealTimeArrivalsQueryType;
    (function (RealTimeArrivalsQueryType) {
        /**
         * One or multiple stops as a comma separated list. Returns the requested number of live arrivals
         * for all lines arriving at the specified stop. Defined by parameter stopQueryType.
         */
        RealTimeArrivalsQueryType["Stops"] = "stops";
        /**
         * Returns the next live arrival times for each stop within the specified line. lineId, for
         * example, '3785742'.
         */
        RealTimeArrivalsQueryType["Line"] = "line";
        /**
         * Returns up to three next Live Arrival times for a given line at a given stop. Comma-separated
         * list including lineId and stop identifier, for example, 1228526,14014071 (lineId,stopId).
         */
        RealTimeArrivalsQueryType["LineAndStop"] = "lineAndStop";
        /**
         * Returns arrivals of a line to stops near the user’s location. The applicable location query
         * specified as a comma separated string composed by latitude followed by longitude e.g.
         * "47.641268,-122.125679".
         */
        RealTimeArrivalsQueryType["Position"] = "position";
    })(RealTimeArrivalsQueryType || (RealTimeArrivalsQueryType = {}));
    /**
     * Defines values for StopQueryType.
     * Possible values include: 'stopId', 'stopKey'
     * @readonly
     * @enum {string}
     */
    var StopQueryType;
    (function (StopQueryType) {
        /**
         * The unique identifier for the respective public transit stop. When referring stops overtime,
         * it is suggested to use stopId that will not change if the physical stop exists.
         */
        StopQueryType["StopId"] = "stopId";
        /**
         * The GTFS stop Id. GTFS stop Ids are provided by the transit authority and are subject to
         * change.
         */
        StopQueryType["StopKey"] = "stopKey";
    })(StopQueryType || (StopQueryType = {}));
    /**
     * Defines values for Type.
     * Possible values include: 'main', 'minor'
     * @readonly
     * @enum {string}
     */
    var Type;
    (function (Type) {
        Type["Main"] = "main";
        Type["Minor"] = "minor";
    })(Type || (Type = {}));
    /**
     * Defines values for Style.
     * Possible values include: 'main'
     * @readonly
     * @enum {string}
     */
    var Style;
    (function (Style) {
        Style["Main"] = "main";
    })(Style || (Style = {}));
    /**
     * Defines values for Text.
     * Possible values include: 'yes', 'no'
     * @readonly
     * @enum {string}
     */
    var Text;
    (function (Text) {
        Text["Yes"] = "yes";
        Text["No"] = "no";
    })(Text || (Text = {}));
    /**
     * Defines values for Text1.
     * Possible values include: 'yes', 'no'
     * @readonly
     * @enum {string}
     */
    var Text1;
    (function (Text1) {
        Text1["Yes"] = "yes";
        Text1["No"] = "no";
    })(Text1 || (Text1 = {}));
    /**
     * Defines values for Text2.
     * Possible values include: 'yes', 'no'
     * @readonly
     * @enum {string}
     */
    var Text2;
    (function (Text2) {
        Text2["Yes"] = "yes";
        Text2["No"] = "no";
    })(Text2 || (Text2 = {}));

    var index = /*#__PURE__*/Object.freeze({
        get EntityType () { return EntityType; },
        get MagnitudeOfDelay () { return MagnitudeOfDelay; },
        get GuidanceInstructionType () { return GuidanceInstructionType; },
        get DrivingSide () { return DrivingSide; },
        get GuidanceManeuver () { return GuidanceManeuver; },
        get TransitType () { return TransitType; },
        get LegType () { return LegType; },
        get RelativeDirection () { return RelativeDirection; },
        get AbsoluteDirection () { return AbsoluteDirection; },
        get ScheduleType () { return ScheduleType; },
        get SearchIndexSet () { return SearchIndexSet; },
        get ConnectorSet () { return ConnectorSet; },
        get OpeningHours () { return OpeningHours; },
        get VehicleLoadType () { return VehicleLoadType; },
        get RouteType () { return RouteType; },
        get Windingness () { return Windingness; },
        get Hilliness () { return Hilliness; },
        get TravelMode () { return TravelMode; },
        get Avoid () { return Avoid; },
        get VehicleEngineType () { return VehicleEngineType; },
        get SectionType () { return SectionType; },
        get RouteRepresentation () { return RouteRepresentation; },
        get ComputeTravelTimeFor () { return ComputeTravelTimeFor; },
        get AlternativeRouteType () { return AlternativeRouteType; },
        get RouteInstructionsType () { return RouteInstructionsType; },
        get TimezoneOptions () { return TimezoneOptions; },
        get TileFormat () { return TileFormat; },
        get GeofenceMode () { return GeofenceMode; },
        get StaticMapLayer () { return StaticMapLayer; },
        get MapTileLayer () { return MapTileLayer; },
        get MapTileStyle () { return MapTileStyle; },
        get MetroAreaQueryType () { return MetroAreaQueryType; },
        get MetroAreaDetailType () { return MetroAreaDetailType; },
        get ObjectType () { return ObjectType; },
        get TransitLineDetailType () { return TransitLineDetailType; },
        get TransitStopQueryType () { return TransitStopQueryType; },
        get TransitStopDetailType () { return TransitStopDetailType; },
        get OriginType () { return OriginType; },
        get DestinationType () { return DestinationType; },
        get ModeType () { return ModeType; },
        get TransitTypeFilter () { return TransitTypeFilter; },
        get AgencyType () { return AgencyType; },
        get TimeType () { return TimeType; },
        get TransitRouteType () { return TransitRouteType; },
        get BikeType () { return BikeType; },
        get TransitItineraryDetailType () { return TransitItineraryDetailType; },
        get RealTimeArrivalsQueryType () { return RealTimeArrivalsQueryType; },
        get StopQueryType () { return StopQueryType; },
        get Type () { return Type; },
        get Style () { return Style; },
        get Text () { return Text; },
        get Text1 () { return Text1; },
        get Text2 () { return Text2; }
    });

    /**
     * An aborter instance implements AbortSignal interface, can abort HTTP requests.
     *
     * - Call Aborter.none to create a new Aborter instance without timeout.
     * - Call Aborter.timeout() to create a new Aborter instance with timeout.
     *
     * For an existing instance aborter:
     * - Call aborter.withTimeout() to create and return a child Aborter instance with timeout.
     * - Call aborter.withValue(key, value) to create and return a child Aborter instance with key/value pair.
     * - Call aborter.abort() to abort current instance and all children instances.
     * - Call aborter.getValue(key) to search and get value with corresponding key from current aborter to all parents.
     *
     * @export
     * @class Aborter
     * @implements {AbortSignalLike}
     */
    var Aborter = /** @class */ (function () {
        // private disposed: boolean = false;
        /**
         * Private constructor for internal usage, creates an instance of Aborter.
         *
         * @param {Aborter} [parent] Optional. Parent aborter.
         * @param {number} [timeout=0] Optional. Timeout before abort in millisecond, 0 means no timeout.
         * @param {string} [key] Optional. Immutable key in string.
         * @param {(string | number | boolean | null)} [value] Optional. Immutable value.
         * @memberof Aborter
         */
        function Aborter(parent, timeout, key, value) {
            var _this = this;
            if (timeout === void 0) { timeout = 0; }
            // tslint:disable-next-line:variable-name
            this._aborted = false;
            this.children = []; // When child object calls dispose(), remove child from here
            this.abortEventListeners = [];
            this.parent = parent;
            this.key = key;
            this.value = value;
            if (timeout > 0) {
                this.timer = setTimeout(function () {
                    _this.abort.call(_this);
                }, timeout);
                // When called, the active Timeout object will not require the Node.js event loop
                // to remain active. If there is no other activity keeping the event loop running,
                // the process may exit before the Timeout object's callback is invoked.
                if (this.timer && typeof this.timer.unref === "function") {
                    this.timer.unref();
                }
            }
        }
        Object.defineProperty(Aborter.prototype, "aborted", {
            /**
             * Status of whether aborted or not.
             *
             * @readonly
             * @type {boolean}
             * @memberof Aborter
             */
            get: function () {
                return this._aborted;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Aborter, "none", {
            /**
             * Creates a new Aborter instance without timeout.
             *
             * @readonly
             * @static
             * @type {Aborter}
             * @memberof Aborter
             */
            get: function () {
                return new Aborter(undefined, 0);
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Creates a new Aborter instance with timeout in milliseconds.
         * Set parameter timeout to 0 will not create a timer.
         *
         * @static
         * @param {number} {timeout} in milliseconds
         * @returns {Aborter}
         * @memberof Aborter
         */
        Aborter.timeout = function (timeout) {
            return new Aborter(undefined, timeout);
        };
        /**
         * Create and return a new Aborter instance, which will be appended as a child node of current Aborter.
         * Current Aborter instance becomes parent node of the new instance. When current or parent Aborter node
         * triggers timeout event, all children node's abort event will be triggered too.
         *
         * When timeout parameter (in millisecond) is larger than 0, the abort event will be triggered when timeout.
         * Otherwise, call abort() method to manually abort.
         *
         * @param {number} {timeout} Timeout in millisecond.
         * @returns {Aborter} The new Aborter instance created.
         * @memberof Aborter
         */
        Aborter.prototype.withTimeout = function (timeout) {
            var childCancelContext = new Aborter(this, timeout);
            this.children.push(childCancelContext);
            return childCancelContext;
        };
        /**
         * Create and return a new Aborter instance, which will be appended as a child node of current Aborter.
         * Current Aborter instance becomes parent node of the new instance. When current or parent Aborter node
         * triggers timeout event, all children nodes abort event will be triggered too.
         *
         * Immutable key value pair will be set into the new created Aborter instance.
         * Call getValue() to find out latest value with corresponding key in the chain of
         * [current node] -> [parent node] and [grand parent node]....
         *
         * @param {string} key
         * @param {(string | number | boolean | null)} [value]
         * @returns {Aborter}
         * @memberof Aborter
         */
        Aborter.prototype.withValue = function (key, value) {
            var childCancelContext = new Aborter(this, 0, key, value);
            this.children.push(childCancelContext);
            return childCancelContext;
        };
        /**
         * Find out latest value with corresponding key in the chain of
         * [current node] -> [parent node] -> [grand parent node] -> ... -> [root node].
         *
         * If key is not found, undefined will be returned.
         *
         * @param {string} key
         * @returns {(string | number | boolean | null | undefined)}
         * @memberof Aborter
         */
        Aborter.prototype.getValue = function (key) {
            for (var parent_1 = this; parent_1; parent_1 = parent_1.parent) {
                if (parent_1.key === key) {
                    return parent_1.value;
                }
            }
            return undefined;
        };
        /**
         * Trigger abort event immediately, the onabort and all abort event listeners will be triggered.
         * Will try to trigger abort event for all children Aborter nodes.
         *
         * - If there is a timeout, the timer will be cancelled.
         * - If aborted is true, nothing will happen.
         *
         * @returns
         * @memberof Aborter
         */
        Aborter.prototype.abort = function () {
            var _this = this;
            if (this.aborted) {
                return;
            }
            this.cancelTimer();
            if (this.onabort) {
                this.onabort.call(this);
            }
            this.abortEventListeners.forEach(function (listener) {
                listener.call(_this, undefined);
            });
            this.children.forEach(function (child) { return child.cancelByParent(); });
            this._aborted = true;
        };
        // public dispose() {
        //   if (this.disposed || this.aborted) {
        //     return;
        //   }
        //   this.cancelTimer();
        //   // (parent)A <- B <- C(child), if B disposes, when A abort, C will not abort
        //   if (this.parent) {
        //     const index = this.parent.children.indexOf(this);
        //     if (index > -1) {
        //       this.parent.children.splice(index, 1);
        //     }
        //   }
        //   this.disposed = true;
        // }
        /**
         * Added new "abort" event listener, only support "abort" event.
         *
         * @param {"abort"} _type Only support "abort" event
         * @param {(this: AbortSignalLike, ev: any) => any} listener
         * @memberof Aborter
         */
        Aborter.prototype.addEventListener = function (
        // tslint:disable-next-line:variable-name
        _type, listener) {
            this.abortEventListeners.push(listener);
        };
        /**
         * Remove "abort" event listener, only support "abort" event.
         *
         * @param {"abort"} _type Only support "abort" event
         * @param {(this: AbortSignalLike, ev: any) => any} listener
         * @memberof Aborter
         */
        Aborter.prototype.removeEventListener = function (
        // tslint:disable-next-line:variable-name
        _type, listener) {
            var index = this.abortEventListeners.indexOf(listener);
            if (index > -1) {
                this.abortEventListeners.splice(index, 1);
            }
        };
        Aborter.prototype.cancelByParent = function () {
            // if (!this.disposed) {
            this.abort();
            // }
        };
        Aborter.prototype.cancelTimer = function () {
            if (this.timer) {
                clearTimeout(this.timer);
            }
        };
        return Aborter;
    }());

    /**
     * Credential is an abstract class for Azure Maps HTTP requests signing. This
     * class will host an credentialPolicyCreator factory which generates CredentialPolicy.
     *
     * @export
     * @abstract
     * @class Credential
     */
    var Credential = /** @class */ (function () {
        function Credential() {
        }
        /**
         * Creates a RequestPolicy object.
         *
         * @param {RequestPolicy} _nextPolicy
         * @param {RequestPolicyOptions} _options
         * @returns {RequestPolicy}
         * @memberof Credential
         */
        Credential.prototype.create = function (
        // tslint:disable-next-line:variable-name
        _nextPolicy, 
        // tslint:disable-next-line:variable-name
        _options) {
            throw new Error("Method should be implemented in children classes.");
        };
        return Credential;
    }());

    /**
     * Credential policy used to sign HTTP(S) requests before sending. This is an
     * abstract class.
     *
     * @export
     * @abstract
     * @class CredentialPolicy
     * @extends {BaseRequestPolicy}
     */
    var CredentialPolicy = /** @class */ (function (_super) {
        __extends(CredentialPolicy, _super);
        function CredentialPolicy() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Sends out request.
         *
         * @param {WebResource} request
         * @returns {Promise<HttpOperationResponse>}
         * @memberof CredentialPolicy
         */
        CredentialPolicy.prototype.sendRequest = function (request) {
            return __awaiter(this, void 0, void 0, function () {
                var _a, _b;
                return __generator(this, function (_c) {
                    switch (_c.label) {
                        case 0:
                            _b = (_a = this._nextPolicy).sendRequest;
                            return [4 /*yield*/, this.signRequest(request)];
                        case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                    }
                });
            });
        };
        /**
         * Child classes must implement this method with request signing. This method
         * will be executed in sendRequest().
         *
         * @protected
         * @abstract
         * @param {WebResource} request
         * @returns {WebResource}
         * @memberof CredentialPolicy
         */
        CredentialPolicy.prototype.signRequest = function (request) {
            // Child classes must override this method with request signing. This method
            // will be executed in sendRequest().
            return request;
        };
        return CredentialPolicy;
    }(BaseRequestPolicy));

    /**
     * MapControlCredentialPolicy is a policy used to sign HTTP requests
     * with shared authentication from an `atlas.Map` instance.
     *
     * @export
     * @class MapControlCredentialPolicy
     * @extends {CredentialPolicy}
     */
    var MapControlCredentialPolicy = /** @class */ (function (_super) {
        __extends(MapControlCredentialPolicy, _super);
        /**
         * Creates an instance of MapControlCredentialPolicy.
         * @param {RequestPolicy} nextPolicy
         * @param {RequestPolicyOptions} options
         * @param {atlas.Map} map
         * @memberof MapControlCredentialPolicy
         */
        function MapControlCredentialPolicy(nextPolicy, options, map) {
            var _this = _super.call(this, nextPolicy, options) || this;
            _this.map = map;
            return _this;
        }
        /**
         * Signs request.
         *
         * @protected
         * @param {WebResource} request
         * @returns {WebResource}
         * @memberof MapControlCredentialPolicy
         */
        MapControlCredentialPolicy.prototype.signRequest = function (request) {
            return __awaiter(this, void 0, void 0, function () {
                var params, _i, _a, key;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: 
                        // Wait for the map to finish initializing its authentication method.
                        // Multiple calls to initialize returns the original promise.
                        return [4 /*yield*/, this.map.authentication.initialize()];
                        case 1:
                            // Wait for the map to finish initializing its authentication method.
                            // Multiple calls to initialize returns the original promise.
                            _b.sent();
                            params = this.map.authentication.signRequest({
                                url: request.url
                            });
                            if (params.headers) {
                                for (_i = 0, _a = Object.keys(params.headers); _i < _a.length; _i++) {
                                    key = _a[_i];
                                    request.headers.set(key, params.headers[key]);
                                }
                            }
                            request.url = params.url;
                            return [2 /*return*/, request];
                    }
                });
            });
        };
        return MapControlCredentialPolicy;
    }(CredentialPolicy));

    /**
     * MapControlCredential for sharing authentication with an `atlas.Map` instance.
     *
     * @export
     * @class MapControlCredential
     * @extends {Credential}
     */
    var MapControlCredential = /** @class */ (function (_super) {
        __extends(MapControlCredential, _super);
        /**
         * Creates an instance of MapControlCredential.
         * @param {atlas.Map} map
         * @memberof MapControlCredential
         */
        function MapControlCredential(map) {
            var _this = _super.call(this) || this;
            _this.map = map;
            return _this;
        }
        /**
         * Creates a MapControlCredentialPolicy object.
         *
         * @param {RequestPolicy} nextPolicy
         * @param {RequestPolicyOptions} options
         * @returns {MapControlCredentialPolicy}
         * @memberof MapControlCredential
         */
        MapControlCredential.prototype.create = function (nextPolicy, options) {
            return new MapControlCredentialPolicy(nextPolicy, options, this.map);
        };
        return MapControlCredential;
    }(Credential));

    /**
     * Set URL parameter name and value. If name exists in URL parameters, old value
     * will be replaced by name key.
     *
     * @export
     * @param {string} url Source URL string
     * @param {string} name Parameter name
     * @param {string} [value] Parameter value
     * @returns {string} An updated URL string
     */
    function setURLParameter(url, name, value) {
        var regex = new RegExp("([?&]+" + name + "=)[^&]*", "g");
        var matched = false;
        url = url.replace(regex, function (_, prefix) {
            matched = true;
            return prefix + value;
        });
        if (!matched) {
            if (url.includes("?")) {
                url += "&" + name + "=" + value;
            }
            else {
                url += "?" + name + "=" + value;
            }
        }
        return url;
    }
    /**
     * Converts a node steam into a byte array
     * @param stream The steam to convert.
     */
    function streamToByteArray(stream) {
        return new Promise(function (resolve, reject) {
            var buffers = [];
            stream.on("error", function (error) { return reject(error); });
            stream.on("data", function (data) { return buffers.push(data); });
            stream.on("end", function () { return resolve(Buffer.concat(buffers)); });
        });
    }
    /**
     * Converts a browser blob into a byte array
     * @param blob The blob to convert.
     */
    function blobToByteArray(blob) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = Uint8Array.bind;
                        return [4 /*yield*/, new Response(blob).arrayBuffer()];
                    case 1: return [2 /*return*/, new (_a.apply(Uint8Array, [void 0, _b.sent()]))()];
                }
            });
        });
    }
    /**
     * Calculates a bounding box which surrounds the specified features.
     * @param features The features to include in the bounding box.
     */
    function calculateBoundingBox(features) {
        var bbox = [Infinity, Infinity, -Infinity, -Infinity];
        for (var _i = 0, features_1 = features; _i < features_1.length; _i++) {
            var feature = features_1[_i];
            switch (feature.geometry.type) {
                case "Point":
                    addPointToBbox(bbox, feature.geometry.coordinates);
                    break;
                case "MultiPoint":
                    feature.geometry.coordinates.forEach(function (point) { return addPointToBbox(bbox, point); });
                    break;
                case "LineString":
                    addLineToBbox(bbox, feature.geometry.coordinates);
                    break;
                case "MultiLineString":
                    feature.geometry.coordinates.forEach(function (line) { return addLineToBbox(bbox, line); });
                    break;
                case "Polygon":
                    addPolyToBbox(bbox, feature.geometry.coordinates);
                    break;
                case "MultiPolygon":
                    feature.geometry.coordinates.forEach(function (poly) { return addPolyToBbox(bbox, poly); });
                    break;
                default:
                    throw new Error("The geometry type " + feature.geometry.type + " isn't supported");
            }
        }
        return bbox;
    }
    /**
     * dds a linestring's coordinates to an existing coordinate array.
     * @param bbox
     * @param point
     */
    function addPointToBbox(bbox, point) {
        bbox[0] = Math.min(bbox[0], point[0]);
        bbox[1] = Math.min(bbox[1], point[1]);
        bbox[2] = Math.max(bbox[2], point[0]);
        bbox[3] = Math.max(bbox[3], point[1]);
    }
    /**
     * Expand a bounding box to include a linestring's coordinates.
     * @param coords The existing bbox to expand to the linestring's coordinates.
     * @param line The linestring's coordinates.
     */
    function addLineToBbox(bbox, line) {
        for (var _i = 0, line_1 = line; _i < line_1.length; _i++) {
            var coord = line_1[_i];
            bbox[0] = Math.min(bbox[0], coord[0]);
            bbox[1] = Math.min(bbox[1], coord[1]);
            bbox[2] = Math.max(bbox[2], coord[0]);
            bbox[3] = Math.max(bbox[3], coord[1]);
        }
    }
    /**
     * Expand a bounding box to include a polygon's coordinates.
     * @param coords The existing bbox to expand to the polygon's coordinates.
     * @param line The linestring's coordinates.
     */
    function addPolyToBbox(bbox, poly) {
        for (var _i = 0, poly_1 = poly; _i < poly_1.length; _i++) {
            var ring = poly_1[_i];
            for (var _a = 0, ring_1 = ring; _a < ring_1.length; _a++) {
                var coord = ring_1[_a];
                bbox[0] = Math.min(bbox[0], coord[0]);
                bbox[1] = Math.min(bbox[1], coord[1]);
                bbox[2] = Math.max(bbox[2], coord[0]);
                bbox[3] = Math.max(bbox[3], coord[1]);
            }
        }
    }

    /**
     * SubscriptionKeyCredentialPolicy is a policy used to sign HTTP requests with a subscription key.
     *
     * @export
     * @class SubscriptionKeyCredentialPolicy
     * @extends {CredentialPolicy}
     */
    var SubscriptionKeyCredentialPolicy = /** @class */ (function (_super) {
        __extends(SubscriptionKeyCredentialPolicy, _super);
        /**
         * Creates an instance of SubscriptionKeyCredentialPolicy.
         * @param {RequestPolicy} nextPolicy
         * @param {RequestPolicyOptions} options
         * @param {string} subscriptionKey
         * @memberof SubscriptionKeyCredentialPolicy
         */
        function SubscriptionKeyCredentialPolicy(nextPolicy, options, subscriptionKey) {
            var _this = _super.call(this, nextPolicy, options) || this;
            _this.subscriptionKey = subscriptionKey;
            return _this;
        }
        /**
         * Signs request.
         *
         * @protected
         * @param {WebResource} request
         * @returns {WebResource}
         * @memberof SubscriptionKeyCredentialPolicy
         */
        SubscriptionKeyCredentialPolicy.prototype.signRequest = function (request) {
            request.url = setURLParameter(request.url, "subscription-key", this.subscriptionKey);
            return request;
        };
        return SubscriptionKeyCredentialPolicy;
    }(CredentialPolicy));

    /**
     * SubscriptionKeyCredential for account key authorization of Azure Maps service.
     *
     * @export
     * @class SubscriptionKeyCredential
     * @extends {Credential}
     */
    var SubscriptionKeyCredential = /** @class */ (function (_super) {
        __extends(SubscriptionKeyCredential, _super);
        /**
         * Creates an instance of SubscriptionKeyCredential.
         * @param {string} subscriptionKey
         * @memberof SubscriptionKeyCredential
         */
        function SubscriptionKeyCredential(subscriptionKey) {
            var _this = _super.call(this) || this;
            _this.subscriptionKey = subscriptionKey;
            return _this;
        }
        /**
         * Creates a SubscriptionKeyCredentialPolicy object.
         *
         * @param {RequestPolicy} nextPolicy
         * @param {RequestPolicyOptions} options
         * @returns {SubscriptionKeyCredentialPolicy}
         * @memberof SubscriptionKeyCredential
         */
        SubscriptionKeyCredential.prototype.create = function (nextPolicy, options) {
            return new SubscriptionKeyCredentialPolicy(nextPolicy, options, this.subscriptionKey);
        };
        return SubscriptionKeyCredential;
    }(Credential));

    var SERVICE_VERSION = "1.0";
    var HTTPURLConnection = {
        HTTP_CONFLICT: 409,
        HTTP_NOT_FOUND: 404,
        HTTP_PRECON_FAILED: 412,
        HTTP_RANGE_NOT_SATISFIABLE: 416
    };
    var HeaderConstants = {
        AUTHORIZATION: "authorization",
        AUTHORIZATION_SCHEME: "Bearer",
        DATE: "date",
        MAP_AGENT: "Map-Agent",
        MS_AM_REQUEST_ORIGIN: "Ms-Am-Request-Origin",
        SERVICE_MODULE: "ServiceModule",
        X_MS_CLIENT_ID: "x-ms-client-id",
    };

    /**
     * TokenCredentialPolicy is a policy used to sign HTTP request with a token.
     * Such as an OAuth bearer token.
     *
     * @export
     * @class TokenCredentialPolicy
     * @extends {CredentialPolicy}
     */
    var TokenCredentialPolicy = /** @class */ (function (_super) {
        __extends(TokenCredentialPolicy, _super);
        /**
         * Creates an instance of TokenCredentialPolicy.
         * @param {RequestPolicy} nextPolicy
         * @param {RequestPolicyOptions} options
         * @param {TokenCredential} tokenCredential
         * @memberof TokenCredentialPolicy
         */
        function TokenCredentialPolicy(nextPolicy, options, tokenCredential) {
            var _this = _super.call(this, nextPolicy, options) || this;
            _this.tokenCredential = tokenCredential;
            _this.authorizationScheme = HeaderConstants.AUTHORIZATION_SCHEME;
            return _this;
        }
        /**
         * Sign request with token.
         *
         * @protected
         * @param {WebResource} request
         * @returns {WebResource}
         * @memberof TokenCredentialPolicy
         */
        TokenCredentialPolicy.prototype.signRequest = function (request) {
            if (!request.headers) {
                request.headers = new HttpHeaders();
            }
            request.headers.set(HeaderConstants.AUTHORIZATION, this.authorizationScheme + " " + this.tokenCredential.token);
            request.headers.set(HeaderConstants.X_MS_CLIENT_ID, this.tokenCredential.clientId);
            return request;
        };
        return TokenCredentialPolicy;
    }(CredentialPolicy));

    /**
     * TokenCredential is a Credential used to generate a TokenCredentialPolicy.
     * Renew token by setting a new token string value to token property.
     *
     * @example
     *  const tokenCredential = new TokenCredential("clientId", "token");
     *  const pipeline = MapsURL.newPipeline(tokenCredential);
     *
     *  const searchURL = new SearchURL(pipeline);
     *
     *  // Set up a timer to refresh the token
     *  const timerID = setInterval(() => {
     *    // Update token by accessing to public tokenCredential.token
     *    tokenCredential.token = "updatedToken";
     *    // WARNING: Timer must be manually stopped! It will forbid GC of tokenCredential
     *    if (shouldStop()) {
     *      clearInterval(timerID);
     *    }
     *  }, 60 * 60 * 1000); // Set an interval time before your token expired
     * @export
     * @class TokenCredential
     * @extends {Credential}
     *
     */
    var TokenCredential = /** @class */ (function (_super) {
        __extends(TokenCredential, _super);
        /**
         * Creates an instance of TokenCredential.
         * @param {string} token
         * @memberof TokenCredential
         */
        function TokenCredential(clientId, token) {
            var _this = _super.call(this) || this;
            _this.clientId = clientId;
            _this.token = token;
            return _this;
        }
        /**
         * Creates a TokenCredentialPolicy object.
         *
         * @param {RequestPolicy} nextPolicy
         * @param {RequestPolicyOptions} options
         * @returns {TokenCredentialPolicy}
         * @memberof TokenCredential
         */
        TokenCredential.prototype.create = function (nextPolicy, options) {
            return new TokenCredentialPolicy(nextPolicy, options, this);
        };
        return TokenCredential;
    }(Credential));

    /**
     * A Pipeline class containing HTTP request policies.
     * You can create a default Pipeline by calling MapsURL.newPipeline().
     * Or you can create a Pipeline with your own policies by the constructor of Pipeline.
     * Refer to MapsURL.newPipeline() and provided policies as reference before
     * implementing your customized Pipeline.
     *
     * @export
     * @class Pipeline
     */
    var Pipeline = /** @class */ (function () {
        /**
         * Creates an instance of Pipeline. Customize HTTPClient by implementing IHttpClient interface.
         *
         * @param {RequestPolicyFactory[]} factories
         * @param {IPipelineOptions} [options={}]
         * @memberof Pipeline
         */
        function Pipeline(factories, options) {
            if (options === void 0) { options = {}; }
            this.factories = factories;
            this.options = options;
        }
        /**
         * Transfer Pipeline object to ServiceClientOptions object which required by
         * ServiceClient constructor.
         *
         * @returns {ServiceClientOptions}
         * @memberof Pipeline
         */
        Pipeline.prototype.toServiceClientOptions = function () {
            return {
                httpClient: this.options.HTTPClient,
                httpPipelineLogger: this.options.logger,
                requestPolicyFactories: this.factories
            };
        };
        return Pipeline;
    }());

    (function (RetryPolicyType) {
        /**
         * Exponential retry. Retry time delay grows exponentially.
         * Literal value `"exponential"`
         */
        RetryPolicyType["EXPONENTIAL"] = "exponential";
        /**
         * Linear retry. Retry time delay grows linearly.
         * Literal value `"fixed"`
         */
        RetryPolicyType["FIXED"] = "fixed";
    })(exports.RetryPolicyType || (exports.RetryPolicyType = {}));
    // Default values of IRetryOptions
    var DEFAULT_RETRY_OPTIONS = {
        maxRetryDelayInMs: 120 * 1000,
        maxTries: 4,
        retryDelayInMs: 4 * 1000,
        retryPolicyType: exports.RetryPolicyType.EXPONENTIAL
    };
    /**
     * Retry policy with exponential retry and linear retry implemented.
     *
     * @class RetryPolicy
     * @extends {BaseRequestPolicy}
     */
    var RetryPolicy = /** @class */ (function (_super) {
        __extends(RetryPolicy, _super);
        /**
         * Creates an instance of RetryPolicy.
         *
         * @param {RequestPolicy} nextPolicy
         * @param {RequestPolicyOptions} options
         * @param {IRetryOptions} [retryOptions=DEFAULT_RETRY_OPTIONS]
         * @memberof RetryPolicy
         */
        function RetryPolicy(nextPolicy, options, retryOptions) {
            if (retryOptions === void 0) { retryOptions = DEFAULT_RETRY_OPTIONS; }
            var _this = _super.call(this, nextPolicy, options) || this;
            // Initialize retry options
            _this.retryOptions = {
                retryPolicyType: typeof (retryOptions.retryPolicyType) === "string"
                    ? retryOptions.retryPolicyType
                    : DEFAULT_RETRY_OPTIONS.retryPolicyType,
                maxTries: typeof (retryOptions.maxTries) === "number" && retryOptions.maxTries >= 1
                    ? Math.floor(retryOptions.maxTries)
                    : DEFAULT_RETRY_OPTIONS.maxTries,
                retryDelayInMs: typeof (retryOptions.retryDelayInMs) === "number" && retryOptions.retryDelayInMs >= 0
                    ? Math.min(retryOptions.retryDelayInMs, typeof (retryOptions.maxRetryDelayInMs) === "number"
                        ? retryOptions.maxRetryDelayInMs
                        : DEFAULT_RETRY_OPTIONS.maxRetryDelayInMs)
                    : DEFAULT_RETRY_OPTIONS.retryDelayInMs,
                maxRetryDelayInMs: typeof (retryOptions.maxRetryDelayInMs) === "number" && retryOptions.maxRetryDelayInMs >= 0
                    ? retryOptions.maxRetryDelayInMs
                    : DEFAULT_RETRY_OPTIONS.maxRetryDelayInMs
            };
            return _this;
        }
        /**
         * Sends request.
         *
         * @param {WebResource} request
         * @returns {Promise<HttpOperationResponse>}
         * @memberof RetryPolicy
         */
        RetryPolicy.prototype.sendRequest = function (request) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    return [2 /*return*/, this.attemptSendRequest(request, 1)];
                });
            });
        };
        /**
         * Decide and perform next retry. Won't mutate request parameter.
         *
         * @protected
         * @param {WebResource} request
         * @param {HttpOperationResponse} response
         * @param {boolean} secondaryHas404  If attempt was against the secondary & it returned a StatusNotFound (404), then
         *                                   the resource was not found. This may be due to replication delay. So, in this
         *                                   case, we'll never try the secondary again for this operation.
         * @param {number} attempt           How many retries has been attempted to performed, starting from 1, which includes
         *                                   the attempt will be performed by this method call.
         * @returns {Promise<HttpOperationResponse>}
         * @memberof RetryPolicy
         */
        RetryPolicy.prototype.attemptSendRequest = function (request, attempt) {
            return __awaiter(this, void 0, void 0, function () {
                var newRequest, response, err_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            newRequest = request.clone();
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            this.logf(exports.HttpPipelineLogLevel.INFO, "RetryPolicy: =====> Try=" + attempt);
                            return [4 /*yield*/, this._nextPolicy.sendRequest(newRequest)];
                        case 2:
                            response = _a.sent();
                            if (!this.shouldRetry(attempt, response)) {
                                return [2 /*return*/, response];
                            }
                            return [3 /*break*/, 4];
                        case 3:
                            err_1 = _a.sent();
                            this.logf(exports.HttpPipelineLogLevel.ERROR, "RetryPolicy: Caught error, message: " + err_1.message + ", code: " + err_1.code);
                            if (!this.shouldRetry(attempt, response, err_1)) {
                                throw err_1;
                            }
                            return [3 /*break*/, 4];
                        case 4: return [4 /*yield*/, this.delay(attempt)];
                        case 5:
                            _a.sent();
                            return [4 /*yield*/, this.attemptSendRequest(request, ++attempt)];
                        case 6: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        /**
         * Decide whether to retry according to last HTTP response and retry counters.
         *
         * @protected
         * @param {boolean} isPrimaryRetry
         * @param {number} attempt
         * @param {HttpOperationResponse} [response]
         * @param {RestError} [err]
         * @returns {boolean}
         * @memberof RetryPolicy
         */
        RetryPolicy.prototype.shouldRetry = function (attempt, response, err) {
            if (attempt >= this.retryOptions.maxTries) {
                this.logf(exports.HttpPipelineLogLevel.INFO, "RetryPolicy: Attempt(s) " + attempt + " >= maxTries " + this.retryOptions
                    .maxTries + ", no further try.");
                return false;
            }
            // Handle network failures, you may need to customize the list when you implement
            // your own http client
            var retriableErrors = [
                "ETIMEDOUT",
                "ESOCKETTIMEDOUT",
                "ECONNREFUSED",
                "ECONNRESET",
                "ENOENT",
                "ENOTFOUND",
                "TIMEOUT",
                "REQUEST_SEND_ERROR" // For default xhr based http client provided in ms-rest-js
            ];
            if (err) {
                for (var _i = 0, retriableErrors_1 = retriableErrors; _i < retriableErrors_1.length; _i++) {
                    var retriableError = retriableErrors_1[_i];
                    if (err.name.toUpperCase().includes(retriableError) ||
                        err.message.toUpperCase().includes(retriableError) ||
                        (err.code && err.code.toUpperCase().includes(retriableError))) {
                        this.logf(exports.HttpPipelineLogLevel.INFO, "RetryPolicy: Network error " + retriableError + " found, will retry.");
                        return true;
                    }
                }
            }
            // If attempt was against the secondary & it returned a StatusNotFound (404), then
            // the resource was not found. This may be due to replication delay. So, in this
            // case, we'll never try the secondary again for this operation.
            if (response || err) {
                var statusCode = response ? response.status : err ? err.statusCode : 0;
                // Server internal error or server timeout
                if (statusCode === 503 || statusCode === 500) {
                    this.logf(exports.HttpPipelineLogLevel.INFO, "RetryPolicy: Will retry for status code " + statusCode + ".");
                    return true;
                }
            }
            return false;
        };
        /**
         * This is to log for debugging purposes only.
         * Comment/uncomment as necessary for releasing/debugging.
         *
         * @private
         * @param {HttpPipelineLogLevel} level
         * @param {string} message
         * @memberof RetryPolicy
         */
        // tslint:disable-next-line:variable-name
        RetryPolicy.prototype.logf = function (_level, _message) {
            // this.log(_level, _message);
        };
        /**
         * Delay a calculated time between retries.
         *
         * @private
         * @param {boolean} isPrimaryRetry
         * @param {number} attempt
         * @returns
         * @memberof RetryPolicy
         */
        RetryPolicy.prototype.delay = function (attempt) {
            return __awaiter(this, void 0, void 0, function () {
                var delayTimeInMs;
                return __generator(this, function (_a) {
                    delayTimeInMs = 0;
                    switch (this.retryOptions.retryPolicyType) {
                        case exports.RetryPolicyType.EXPONENTIAL:
                            delayTimeInMs = Math.min((Math.pow(2, attempt) - 1) * this.retryOptions.retryDelayInMs, this.retryOptions.maxRetryDelayInMs);
                            break;
                        case exports.RetryPolicyType.FIXED:
                            delayTimeInMs = this.retryOptions.retryDelayInMs;
                            break;
                    }
                    this.logf(exports.HttpPipelineLogLevel.INFO, "RetryPolicy: Delay for " + delayTimeInMs + "ms");
                    return [2 /*return*/, delay(delayTimeInMs)];
                });
            });
        };
        return RetryPolicy;
    }(BaseRequestPolicy));

    /**
     * RetryPolicyFactory is a factory class helping generating RetryPolicy objects.
     *
     * @export
     * @class RetryPolicyFactory
     * @implements {RequestPolicyFactory}
     */
    var RetryPolicyFactory = /** @class */ (function () {
        /**
         * Creates an instance of RetryPolicyFactory.
         * @param {IRetryOptions} [retryOptions]
         * @memberof RetryPolicyFactory
         */
        function RetryPolicyFactory(retryOptions) {
            this.retryOptions = retryOptions;
        }
        RetryPolicyFactory.prototype.create = function (nextPolicy, options) {
            return new RetryPolicy(nextPolicy, options, this.retryOptions);
        };
        return RetryPolicyFactory;
    }());

    // Default values of IRetryOptions
    var DEFAULT_REQUEST_LOG_OPTIONS = {
        logWarningIfTryOverThreshold: 3000
    };
    /**
     * LoggingPolicy is a policy used to log requests.
     *
     * @class LoggingPolicy
     * @extends {BaseRequestPolicy}
     */
    var LoggingPolicy = /** @class */ (function (_super) {
        __extends(LoggingPolicy, _super);
        /**
         * Creates an instance of LoggingPolicy.
         * @param {RequestPolicy} nextPolicy
         * @param {RequestPolicyOptions} options
         * @param {IRequestLogOptions} [loggingOptions=DEFAULT_REQUEST_LOG_OPTIONS]
         * @memberof LoggingPolicy
         */
        function LoggingPolicy(nextPolicy, options, loggingOptions) {
            if (loggingOptions === void 0) { loggingOptions = DEFAULT_REQUEST_LOG_OPTIONS; }
            var _this = _super.call(this, nextPolicy, options) || this;
            _this.tryCount = 0;
            _this.operationStartTime = new Date();
            _this.requestStartTime = new Date();
            _this.loggingOptions = loggingOptions;
            return _this;
        }
        /**
         * Sends out request.
         *
         * @param {WebResource} request
         * @returns {Promise<HttpOperationResponse>}
         * @memberof LoggingPolicy
         */
        LoggingPolicy.prototype.sendRequest = function (request) {
            return __awaiter(this, void 0, void 0, function () {
                var safeURL, response, requestEndTime, requestCompletionTime, operationDuration, currentLevel, logMessage, errorString, messageInfo, err_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.tryCount++;
                            this.requestStartTime = new Date();
                            if (this.tryCount === 1) {
                                this.operationStartTime = this.requestStartTime;
                            }
                            safeURL = request.url;
                            this.log(exports.HttpPipelineLogLevel.INFO, "'" + safeURL + "'==> OUTGOING REQUEST (Try number=" + this.tryCount + ").");
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, this._nextPolicy.sendRequest(request)];
                        case 2:
                            response = _a.sent();
                            requestEndTime = new Date();
                            requestCompletionTime = requestEndTime.getTime() - this.requestStartTime.getTime();
                            operationDuration = requestEndTime.getTime() - this.operationStartTime.getTime();
                            currentLevel = exports.HttpPipelineLogLevel.INFO;
                            logMessage = "";
                            if (this.shouldLog(exports.HttpPipelineLogLevel.INFO)) {
                                // Assume success and default to informational logging.
                                logMessage = "Successfully Received Response. ";
                            }
                            // If the response took too long, we'll upgrade to warning.
                            if (requestCompletionTime >=
                                this.loggingOptions.logWarningIfTryOverThreshold) {
                                // Log a warning if the try duration exceeded the specified threshold.
                                if (this.shouldLog(exports.HttpPipelineLogLevel.WARNING)) {
                                    currentLevel = exports.HttpPipelineLogLevel.WARNING;
                                    logMessage = "SLOW OPERATION. Duration > " + this.loggingOptions.logWarningIfTryOverThreshold + " ms. ";
                                }
                            }
                            if ((response.status >= 400 &&
                                response.status <= 499 &&
                                (response.status !== HTTPURLConnection.HTTP_NOT_FOUND &&
                                    response.status !== HTTPURLConnection.HTTP_CONFLICT &&
                                    response.status !== HTTPURLConnection.HTTP_PRECON_FAILED &&
                                    response.status !==
                                        HTTPURLConnection.HTTP_RANGE_NOT_SATISFIABLE)) ||
                                (response.status >= 500 && response.status <= 509)) {
                                errorString = "REQUEST ERROR: HTTP request failed with status code: " + response.status + ". ";
                                logMessage = errorString;
                                currentLevel = exports.HttpPipelineLogLevel.ERROR;
                            }
                            messageInfo = "Request try:" + this.tryCount + ", status:" + response.status + " request duration:" + requestCompletionTime + " ms, operation duration:" + operationDuration + " ms\n";
                            this.log(currentLevel, logMessage + messageInfo);
                            return [2 /*return*/, response];
                        case 3:
                            err_1 = _a.sent();
                            this.log(exports.HttpPipelineLogLevel.ERROR, "Unexpected failure attempting to make request. Error message: " + err_1.message);
                            throw err_1;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        return LoggingPolicy;
    }(BaseRequestPolicy));

    /**
     * LoggingPolicyFactory is a factory class helping generating LoggingPolicy objects.
     *
     * @export
     * @class LoggingPolicyFactory
     * @implements {RequestPolicyFactory}
     */
    var LoggingPolicyFactory = /** @class */ (function () {
        /**
         * Creates an instance of LoggingPolicyFactory.
         * @param {IRequestLogOptions} [loggingOptions]
         * @memberof LoggingPolicyFactory
         */
        function LoggingPolicyFactory(loggingOptions) {
            this.loggingOptions = loggingOptions;
        }
        LoggingPolicyFactory.prototype.create = function (nextPolicy, options) {
            return new LoggingPolicy(nextPolicy, options, this.loggingOptions);
        };
        return LoggingPolicyFactory;
    }());

    // Copyright (c) Microsoft Corporation. All rights reserved.
    /**
     * A long-running operation polling strategy base class that other polling strategies should extend.
     */
    var LROPollStrategy = /** @class */ (function () {
        function LROPollStrategy(_azureServiceClient, _pollState) {
            this._azureServiceClient = _azureServiceClient;
            this._pollState = _pollState;
        }
        LROPollStrategy.prototype.getOperationStatus = function () {
            return this._pollState.state;
        };
        /**
         * Get whether or not this poll strategy's LRO is finished.
         * @returns Whether or not this poll strategy's LRO is finished.
         */
        LROPollStrategy.prototype.isFinished = function () {
            return isFinished(this._pollState.state);
        };
        /**
         * Send poll requests that check the LRO's status until it is determined that the LRO is finished.
         * @returns Whether or not the LRO succeeded.
         */
        LROPollStrategy.prototype.pollUntilFinished = function () {
            return __awaiter(this, void 0, void 0, function () {
                var delayInSeconds;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!!this.isFinished()) return [3 /*break*/, 3];
                            delayInSeconds = getDelayInSeconds(this._azureServiceClient, this._pollState.mostRecentResponse);
                            return [4 /*yield*/, delay(delayInSeconds * 1000)];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this.sendPollRequest()];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 0];
                        case 3: return [2 /*return*/, this.isFinalStatusAcceptable()];
                    }
                });
            });
        };
        LROPollStrategy.prototype.shouldDoFinalGetResourceRequest = function () {
            var initialRequestMethod = this._pollState.initialResponse.request.method;
            return !this._pollState.resource && (initialRequestMethod === "PUT" || initialRequestMethod === "PATCH" || initialRequestMethod === "POST");
        };
        LROPollStrategy.prototype.getMostRecentResponse = function () {
            return this._pollState.mostRecentResponse;
        };
        LROPollStrategy.prototype.getOperationResponse = function () {
            return __awaiter(this, void 0, void 0, function () {
                var response, result, resource;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.shouldDoFinalGetResourceRequest()) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.doFinalGetResourceRequest()];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            response = this._pollState.mostRecentResponse;
                            result = __assign({}, response, { headers: response.headers.clone() });
                            resource = this._pollState.resource;
                            if (!resource) {
                                result.bodyAsText = response.bodyAsText;
                                result.parsedBody = response.parsedBody;
                            }
                            else if (typeof resource.valueOf() === "string") {
                                result.bodyAsText = resource;
                                result.parsedBody = JSON.parse(resource);
                            }
                            else {
                                result.bodyAsText = JSON.stringify(resource);
                                result.parsedBody = resource;
                            }
                            return [2 /*return*/, result];
                    }
                });
            });
        };
        LROPollStrategy.prototype.getRestError = function () {
            var error = new RestError("");
            error.request = stripRequest(this._pollState.mostRecentRequest);
            error.response = this._pollState.mostRecentResponse;
            error.message = "Long running operation failed with status: \"" + this._pollState.state + "\".";
            error.body = this._pollState.resource;
            if (error.body) {
                var innerError = error.body.error;
                if (innerError) {
                    if (innerError.message) {
                        error.message = "Long running operation failed with error: \"" + innerError.message + "\".";
                    }
                    if (innerError.code) {
                        error.code = innerError.code;
                    }
                }
            }
            return error;
        };
        LROPollStrategy.prototype.updateState = function (url, shouldDeserialize) {
            var _this = this;
            return this.updateOperationStatus(url, shouldDeserialize).then(function (result) {
                _this._pollState.state = getProvisioningState(result.parsedBody) || "Succeeded";
                _this._pollState.mostRecentResponse = result;
                _this._pollState.mostRecentRequest = result.request;
                _this._pollState.resource = getResponseBody(result);
            }).catch(function (error) {
                var resultStatus;
                if (error.response && error.response.status) {
                    resultStatus = error.response.status;
                    if (_this._pollState.initialResponse.request.method !== "DELETE" || resultStatus < 400 || 499 < resultStatus) {
                        throw error;
                    }
                }
                else {
                    throw error;
                }
            });
        };
        /**
         * Retrieves operation status by querying the operation URL.
         * @param {string} statusUrl URL used to poll operation result.
         */
        LROPollStrategy.prototype.updateOperationStatus = function (statusUrl, shouldDeserialize) {
            var requestUrl = statusUrl.replace(" ", "%20");
            var httpRequest = new WebResource(requestUrl, "GET");
            var pollState = this._pollState;
            httpRequest.operationSpec = pollState.mostRecentRequest.operationSpec;
            httpRequest.shouldDeserialize = shouldDeserialize;
            httpRequest.operationResponseGetter = getOperationResponse$1;
            var options = pollState.options;
            if (options && options.customHeaders) {
                var customHeaders = options.customHeaders;
                for (var _i = 0, _a = Object.keys(customHeaders); _i < _a.length; _i++) {
                    var headerName = _a[_i];
                    httpRequest.headers.set(headerName, customHeaders[headerName]);
                }
            }
            return this._azureServiceClient.sendRequest(httpRequest);
        };
        LROPollStrategy.prototype.getPollState = function () {
            return this._pollState;
        };
        return LROPollStrategy;
    }());
    function getOperationResponse$1(operationSpec, response) {
        var statusCode = response.status;
        var operationResponses = operationSpec.responses;
        var result = operationResponses[statusCode];
        if (!result) {
            if (statusCode === 200) {
                result = operationResponses[201] || operationResponses[202];
            }
            else if (201 <= statusCode && statusCode <= 299) {
                result = {};
            }
        }
        return result;
    }
    function getDelayInSeconds(azureServiceClient, previousResponse) {
        var delayInSeconds = 30;
        if (azureServiceClient.longRunningOperationRetryTimeout != undefined) {
            delayInSeconds = azureServiceClient.longRunningOperationRetryTimeout;
        }
        else {
            var retryAfterHeaderValue = previousResponse.headers.get("retry-after");
            if (retryAfterHeaderValue) {
                var retryAfterDelayInSeconds = parseInt(retryAfterHeaderValue);
                if (!Number.isNaN(retryAfterDelayInSeconds)) {
                    delayInSeconds = retryAfterDelayInSeconds;
                }
            }
        }
        return delayInSeconds;
    }
    function getProvisioningState(responseBody) {
        var result;
        if (responseBody) {
            if (responseBody.provisioningState) {
                result = responseBody.provisioningState;
            }
            else if (responseBody.properties) {
                result = responseBody.properties.provisioningState;
            }
        }
        return result;
    }
    function getResponseBody(response) {
        var result;
        try {
            if (response.parsedBody) {
                result = response.parsedBody;
            }
            else if (response.bodyAsText && response.bodyAsText.length > 0) {
                result = JSON.parse(response.bodyAsText);
            }
        }
        catch (error) {
            var deserializationError = new RestError("Error \"" + error + "\" occurred in parsing the responseBody \" +\n      \"while creating the PollingState for Long Running Operation- \"" + response.bodyAsText + "\"");
            deserializationError.request = response.request;
            deserializationError.response = response;
            throw deserializationError;
        }
        return result;
    }
    function getStatusFromResponse(response, responseBody) {
        if (responseBody == undefined) {
            responseBody = getResponseBody(response);
        }
        var result;
        switch (response.status) {
            case 202:
                result = "InProgress";
                break;
            case 204:
                result = "Succeeded";
                break;
            case 201:
                result = getProvisioningState(responseBody) || "InProgress";
                break;
            case 200:
                var provisioningState = getProvisioningState(responseBody);
                if (provisioningState) {
                    result = provisioningState;
                }
                else if (getAzureAsyncOperationHeaderValue(response) || getLocationHeaderValue(response)) {
                    result = "InProgress";
                }
                else {
                    result = "Succeeded";
                }
                break;
            default:
                result = "Failed";
                break;
        }
        return result;
    }
    var terminalStates = ["Succeeded", "Failed", "Canceled", "Cancelled"];
    /**
     * Get whether or not a long-running operation with the provided status is finished.
     * @param status The current status of a long-running operation.
     * @returns Whether or not a long-running operation with the provided status is finished.
     */
    function isFinished(status) {
        var result = false;
        for (var _i = 0, terminalStates_1 = terminalStates; _i < terminalStates_1.length; _i++) {
            var terminalState = terminalStates_1[_i];
            if (longRunningOperationStatesEqual(status, terminalState)) {
                result = true;
                break;
            }
        }
        return result;
    }
    function longRunningOperationStatesEqual(lhs, rhs) {
        var lhsLowerCased = lhs && lhs.toLowerCase();
        var rhsLowerCased = rhs && rhs.toLowerCase();
        return lhsLowerCased === rhsLowerCased;
    }
    /**
     * Create a new long-running operation polling strategy based on the provided initial response.
     * @param initialResponse The initial response to the long-running operation's initial request.
     * @param azureServiceClient The AzureServiceClient that was used to send the initial request.
     * @param options Any options that were provided to the initial request.
     */
    function createLROPollStrategyFromInitialResponse(initialResponse, azureServiceClient, options) {
        var initialRequestMethod = initialResponse.request.method;
        var initialResponseStatus = initialResponse.status;
        var lroPollStrategyType;
        if (getAzureAsyncOperationHeaderValue(initialResponse)) {
            lroPollStrategyType = "AzureAsyncOperation";
        }
        else if (getLocationHeaderValue(initialResponse)) {
            lroPollStrategyType = "Location";
        }
        else if (initialRequestMethod === "PUT" || initialRequestMethod === "PATCH") {
            lroPollStrategyType = "GetResource";
        }
        else if (initialResponseStatus !== 201 && initialResponseStatus !== 202 && !isFinished(getStatusFromResponse(initialResponse))) {
            throw new Error("Can't determine long running operation polling strategy.");
        }
        var result;
        if (lroPollStrategyType) {
            var resource = getResponseBody(initialResponse);
            var lroPollState = {
                pollStrategyType: lroPollStrategyType,
                options: options,
                initialResponse: initialResponse,
                mostRecentResponse: initialResponse,
                mostRecentRequest: initialResponse.request,
                azureAsyncOperationHeaderValue: getAzureAsyncOperationHeaderValue(initialResponse),
                locationHeaderValue: getLocationHeaderValue(initialResponse),
                resource: resource,
                state: getStatusFromResponse(initialResponse, resource)
            };
            result = createLROPollStrategyFromPollState(azureServiceClient, lroPollState);
        }
        else {
            result = undefined;
        }
        return result;
    }
    function createLROPollStrategyFromPollState(azureServiceClient, lroPollState) {
        var result;
        switch (lroPollState.pollStrategyType) {
            case "AzureAsyncOperation":
                result = new AzureAsyncOperationLROPollStrategy(azureServiceClient, lroPollState);
                break;
            case "Location":
                result = new LocationLROPollStrategy(azureServiceClient, lroPollState);
                break;
            case "GetResource":
                result = new GetResourceLROPollStrategy(azureServiceClient, lroPollState);
                break;
            default:
                throw new Error("Unrecognized LRO poll strategy type: \"" + lroPollState.pollStrategyType + "\"");
                break;
        }
        return result;
    }
    function getLocationHeaderValue(response) {
        return response.headers.get("location");
    }
    /**
     * A long-running operation polling strategy that is based on the location header.
     */
    var LocationLROPollStrategy = /** @class */ (function (_super) {
        __extends(LocationLROPollStrategy, _super);
        function LocationLROPollStrategy() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        LocationLROPollStrategy.prototype.locationStrategyShouldDeserialize = function (parsedResponse) {
            var shouldDeserialize = false;
            var initialResponse = this._pollState.initialResponse;
            var initialRequestMethod = initialResponse.request.method;
            var statusCode = parsedResponse.status;
            if (statusCode === 200 ||
                (statusCode === 201 && (initialRequestMethod === "PUT" || initialRequestMethod === "PATCH")) ||
                (statusCode === 204 && (initialRequestMethod === "DELETE" || initialRequestMethod === "POST"))) {
                shouldDeserialize = true;
            }
            return shouldDeserialize;
        };
        /**
         * Retrieve PUT operation status by polling from "location" header.
         * @param {string} method - The HTTP method.
         * @param {PollingState} pollingState - The object to persist current operation state.
         */
        LocationLROPollStrategy.prototype.sendPollRequest = function () {
            var lroPollState = this._pollState;
            return this.updateOperationStatus(lroPollState.locationHeaderValue, this.locationStrategyShouldDeserialize.bind(this)).then(function (result) {
                var locationHeaderValue = getLocationHeaderValue(result);
                if (locationHeaderValue) {
                    lroPollState.locationHeaderValue = locationHeaderValue;
                }
                lroPollState.mostRecentResponse = result;
                lroPollState.mostRecentRequest = result.request;
                var initialResponse = lroPollState.initialResponse;
                var initialRequestMethod = initialResponse.request.method;
                var initialResponseStatusCode = initialResponse.status;
                var statusCode = result.status;
                if (statusCode === 202) {
                    lroPollState.state = "InProgress";
                }
                else if (statusCode === 200 ||
                    (statusCode === 201 && (initialRequestMethod === "PUT" || initialRequestMethod === "PATCH")) ||
                    (statusCode === 204 && (initialRequestMethod === "DELETE" || initialRequestMethod === "POST"))) {
                    lroPollState.state = "Succeeded";
                    lroPollState.resource = getResponseBody(result);
                }
                else if (statusCode === 404 && initialRequestMethod === "POST" &&
                    (initialResponseStatusCode === 200 || initialResponseStatusCode === 201 || initialResponseStatusCode === 202)) {
                    lroPollState.state = "Failed";
                    lroPollState.resource = getResponseBody(result);
                }
                else if (400 <= statusCode && statusCode <= 499) {
                    var resultBody = result.bodyAsText;
                    var errorMessage = resultBody;
                    try {
                        var resultObject = JSON.parse(resultBody);
                        errorMessage = resultObject.message;
                    }
                    catch (parseError) {
                        // Ignore the exception, use resultBody as the error message
                    }
                    throw new RestError(errorMessage, undefined, statusCode, stripRequest(result.request), result, resultBody);
                }
                else {
                    throw new Error("The response with status code " + statusCode + " from polling for long running operation url \"" + lroPollState.locationHeaderValue + "\" is not valid.");
                }
            });
        };
        LocationLROPollStrategy.prototype.isFinalStatusAcceptable = function () {
            var lroPollState = this._pollState;
            var initialResponse = lroPollState.initialResponse;
            var initialResponseStatusCode = initialResponse.status;
            return longRunningOperationStatesEqual(lroPollState.state, "Succeeded") ||
                (initialResponse.request.method === "POST" && lroPollState.mostRecentResponse.status === 404 &&
                    (initialResponseStatusCode === 200 ||
                        initialResponseStatusCode === 201 ||
                        initialResponseStatusCode === 202));
        };
        LocationLROPollStrategy.prototype.shouldDoFinalGetResourceRequest = function () {
            var lroPollState = this._pollState;
            var initialResponse = lroPollState.initialResponse;
            var result;
            var initialRequestMethod = initialResponse.request.method;
            var initialResponseStatusCode = initialResponse.status;
            if (initialRequestMethod === "POST" && lroPollState.mostRecentResponse.status === 404 &&
                (initialResponseStatusCode === 200 ||
                    initialResponseStatusCode === 201 ||
                    initialResponseStatusCode === 202)) {
                result = false;
            }
            else {
                result = _super.prototype.shouldDoFinalGetResourceRequest.call(this) ||
                    (initialRequestMethod === "POST" && initialResponseStatusCode === 201);
            }
            return result;
        };
        LocationLROPollStrategy.prototype.doFinalGetResourceRequest = function () {
            var lroPollState = this._pollState;
            var initialResponse = lroPollState.initialResponse;
            var getResourceRequestUrl;
            var initialResponseStatusCode = initialResponse.status;
            var initialRequest = initialResponse.request;
            if (initialRequest.method === "POST" &&
                (initialResponseStatusCode === 200 ||
                    initialResponseStatusCode === 201 ||
                    initialResponseStatusCode === 202)) {
                getResourceRequestUrl = lroPollState.locationHeaderValue;
            }
            else {
                getResourceRequestUrl = initialRequest.url;
            }
            return this.updateState(getResourceRequestUrl, true);
        };
        return LocationLROPollStrategy;
    }(LROPollStrategy));
    function getAzureAsyncOperationHeaderValue(response) {
        return response.headers.get("azure-asyncoperation");
    }
    /**
     * A long-running operation polling strategy that is based on the azure-asyncoperation header.
     */
    var AzureAsyncOperationLROPollStrategy = /** @class */ (function (_super) {
        __extends(AzureAsyncOperationLROPollStrategy, _super);
        function AzureAsyncOperationLROPollStrategy() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Retrieve operation status by polling from "azure-asyncoperation" header.
         * @param {PollingState} pollingState - The object to persist current operation state.
         * @param {boolean} inPostOrDelete - Invoked by Post Or Delete operation.
         */
        AzureAsyncOperationLROPollStrategy.prototype.sendPollRequest = function () {
            var lroPollState = this._pollState;
            return this.updateOperationStatus(lroPollState.azureAsyncOperationHeaderValue, false).then(function (response) {
                var statusCode = response.status;
                var parsedResponse = response.parsedBody;
                if (statusCode !== 200 && statusCode !== 201 && statusCode !== 202 && statusCode !== 204) {
                    var error = new RestError("Invalid status code (" + statusCode + ") with response body \"" + response.bodyAsText + "\" occurred when polling for operation status.");
                    error.statusCode = statusCode;
                    error.request = stripRequest(response.request);
                    error.response = response;
                    error.body = parsedResponse;
                    throw error;
                }
                if (!parsedResponse) {
                    throw new Error("The response from long running operation does not contain a body.");
                }
                else if (!parsedResponse.status) {
                    throw new Error("The response \"" + response.bodyAsText + "\" from long running operation does not contain the status property.");
                }
                var azureAsyncOperationHeaderValue = getAzureAsyncOperationHeaderValue(response);
                if (azureAsyncOperationHeaderValue) {
                    lroPollState.azureAsyncOperationHeaderValue = azureAsyncOperationHeaderValue;
                }
                lroPollState.state = parsedResponse.status;
                lroPollState.mostRecentResponse = response;
                lroPollState.mostRecentRequest = response.request;
                lroPollState.resource = getResponseBody(response);
            });
        };
        AzureAsyncOperationLROPollStrategy.prototype.shouldDoFinalGetResourceRequest = function () {
            var lroPollState = this._pollState;
            var initialResponse = lroPollState.initialResponse;
            var initialRequestMethod = initialResponse.request.method;
            var result = false;
            if (initialRequestMethod === "PUT" || initialRequestMethod === "PATCH") {
                result = true;
            }
            else {
                if (lroPollState.locationHeaderValue) {
                    var initialResponseStatusCode = initialResponse.status;
                    if (initialRequestMethod === "POST") {
                        result = initialResponseStatusCode === 200 || initialResponseStatusCode === 201;
                    }
                    else if (initialRequestMethod === "DELETE") {
                        result = initialResponseStatusCode === 200 || initialResponseStatusCode === 202;
                    }
                }
            }
            return result;
        };
        AzureAsyncOperationLROPollStrategy.prototype.doFinalGetResourceRequest = function () {
            var lroPollState = this._pollState;
            var locationHeaderValue = lroPollState.locationHeaderValue;
            var initialResponse = lroPollState.initialResponse;
            var initialRequest = initialResponse.request;
            var getResourceRequestUrl = initialRequest.url;
            if (locationHeaderValue) {
                var initialRequestMethod = initialRequest.method;
                var initialResponseStatusCode = initialResponse.status;
                if (initialRequestMethod === "POST" && (initialResponseStatusCode === 200 || initialResponseStatusCode === 201 || initialResponseStatusCode === 202)) {
                    getResourceRequestUrl = locationHeaderValue;
                }
                else if (initialRequestMethod === "DELETE" && (initialResponseStatusCode === 200 || initialResponseStatusCode === 202)) {
                    getResourceRequestUrl = locationHeaderValue;
                }
            }
            return this.updateState(getResourceRequestUrl, true);
        };
        AzureAsyncOperationLROPollStrategy.prototype.isFinalStatusAcceptable = function () {
            var lroPollState = this._pollState;
            var initialResponse = lroPollState.initialResponse;
            var initialResponseStatusCode = initialResponse.status;
            return longRunningOperationStatesEqual(lroPollState.state, "Succeeded") ||
                (initialResponse.request.method === "POST" && (initialResponseStatusCode === 200 || initialResponseStatusCode === 201));
        };
        return AzureAsyncOperationLROPollStrategy;
    }(LROPollStrategy));
    /**
     * A long-running operation polling strategy that is based on the resource's provisioning state.
     */
    var GetResourceLROPollStrategy = /** @class */ (function (_super) {
        __extends(GetResourceLROPollStrategy, _super);
        function GetResourceLROPollStrategy() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        GetResourceLROPollStrategy.prototype.sendPollRequest = function () {
            var lroPollState = this._pollState;
            return this.updateOperationStatus(lroPollState.initialResponse.request.url, false).then(function (result) {
                var statusCode = result.status;
                var responseBody = result.parsedBody;
                if (statusCode !== 200 && statusCode !== 201 && statusCode !== 202 && statusCode !== 204) {
                    var error = new RestError("Invalid status code with response body \"" + result.bodyAsText + "\" occurred when polling for operation status.");
                    error.statusCode = statusCode;
                    error.request = stripRequest(result.request);
                    error.response = result;
                    error.body = responseBody;
                    throw error;
                }
                if (!result.parsedBody) {
                    throw new Error("The response from long running operation does not contain a body.");
                }
                lroPollState.state = getProvisioningState(result.parsedBody) || "Succeeded";
                lroPollState.mostRecentResponse = result;
                lroPollState.mostRecentRequest = result.request;
                lroPollState.resource = getResponseBody(result);
            });
        };
        GetResourceLROPollStrategy.prototype.isFinalStatusAcceptable = function () {
            return longRunningOperationStatesEqual(this._pollState.state, "Succeeded");
        };
        GetResourceLROPollStrategy.prototype.doFinalGetResourceRequest = function () {
            return this.sendPollRequest();
        };
        return GetResourceLROPollStrategy;
    }(LROPollStrategy));

    // Copyright (c) Microsoft Corporation. All rights reserved.
    /**
     * An HTTP operation response that provides special methods for interacting with LROs (long running
     * operations).
     */
    var LROPoller = /** @class */ (function () {
        /**
         * Create a new HttpLongRunningOperationResponse.
         * @param _lroPollStrategy The LROPollStrategy that this HttpLongRunningOperationResponse will
         * use to interact with the LRO.
         */
        function LROPoller(_lroPollStrategy, _initialResponse) {
            this._lroPollStrategy = _lroPollStrategy;
            this._initialResponse = _initialResponse;
        }
        /**
         * Get the first response that the service sent back when the LRO was initiated.
         */
        LROPoller.prototype.getInitialResponse = function () {
            return this._initialResponse;
        };
        /**
         * Get the most recent response that the service sent back during this LRO.
         */
        LROPoller.prototype.getMostRecentResponse = function () {
            var lroPollStrategy = this._lroPollStrategy;
            return !lroPollStrategy ? this._initialResponse : lroPollStrategy.getMostRecentResponse();
        };
        /**
         * Get whether or not the LRO is finished.
         */
        LROPoller.prototype.isFinished = function () {
            var lroPollStrategy = this._lroPollStrategy;
            return !lroPollStrategy ? true : lroPollStrategy.isFinished();
        };
        /**
         * Get whether or not the LRO is finished and its final state is acceptable. If the LRO has not
         * finished yet, then undefined will be returned. An "acceptable" final state is determined by the
         * LRO strategy that the Azure service uses to perform long running operations.
         */
        LROPoller.prototype.isFinalStatusAcceptable = function () {
            var result;
            var lroPollStrategy = this._lroPollStrategy;
            if (!lroPollStrategy) {
                result = true;
            }
            else if (lroPollStrategy.isFinished()) {
                result = lroPollStrategy.isFinalStatusAcceptable();
            }
            return result;
        };
        /**
         * Get the current status of the LRO.
         */
        LROPoller.prototype.getOperationStatus = function () {
            var lroPollStrategy = this._lroPollStrategy;
            return !lroPollStrategy ? "Succeeded" : lroPollStrategy.getOperationStatus();
        };
        /**
         * If the LRO is finished and in an acceptable state, then return the HttpOperationResponse. If
         * the LRO is finished and not in an acceptable state, then throw the error that the LRO produced.
         * If the LRO is not finished, then return undefined.
         */
        LROPoller.prototype.getOperationResponse = function () {
            var result;
            var lroPollStrategy = this._lroPollStrategy;
            if (!lroPollStrategy) {
                result = Promise.resolve(this._initialResponse);
            }
            else if (!lroPollStrategy.isFinished()) {
                result = Promise.resolve(undefined);
            }
            else if (lroPollStrategy.isFinalStatusAcceptable()) {
                result = lroPollStrategy.getOperationResponse();
            }
            else {
                throw lroPollStrategy.getRestError();
            }
            return result;
        };
        /**
         * Send a single poll request and return the LRO's state.
         */
        LROPoller.prototype.poll = function () {
            var result;
            var lroPollStrategy = this._lroPollStrategy;
            if (!lroPollStrategy) {
                result = Promise.resolve("Succeeded");
            }
            else {
                result = lroPollStrategy.sendPollRequest().then(function () {
                    return lroPollStrategy.getOperationStatus();
                });
            }
            return result;
        };
        /**
         * Send poll requests that check the LRO's status until it is determined that the LRO is finished.
         */
        LROPoller.prototype.pollUntilFinished = function () {
            return __awaiter(this, void 0, void 0, function () {
                var result, lroPollStrategy;
                return __generator(this, function (_a) {
                    lroPollStrategy = this._lroPollStrategy;
                    if (!lroPollStrategy) {
                        result = Promise.resolve(flattenAzureResponse(this._initialResponse));
                    }
                    else {
                        result = lroPollStrategy.pollUntilFinished().then(function (succeeded) {
                            if (succeeded) {
                                return lroPollStrategy.getOperationResponse().then(flattenAzureResponse);
                            }
                            else {
                                throw lroPollStrategy.getRestError();
                            }
                        });
                    }
                    return [2 /*return*/, result];
                });
            });
        };
        /**
         * Get an LROPollState object that can be used to poll this LRO in a different context (such as on
         * a different process or a different machine). If the LRO couldn't produce an LRO polling
         * strategy, then this will return undefined.
         */
        LROPoller.prototype.getPollState = function () {
            var lroPollStrategy = this._lroPollStrategy;
            return !lroPollStrategy ? undefined : lroPollStrategy.getPollState();
        };
        return LROPoller;
    }());
    function createLROPollerFromInitialResponse(azureServiceClient, initialResponse, options) {
        var lroPollStrategy = createLROPollStrategyFromInitialResponse(initialResponse, azureServiceClient, options);
        return new LROPoller(lroPollStrategy, initialResponse);
    }
    function createLROPollerFromPollState(azureServiceClient, lroMemento) {
        var lroPollStrategy = createLROPollStrategyFromPollState(azureServiceClient, lroMemento);
        return new LROPoller(lroPollStrategy, lroMemento.initialResponse);
    }
    function flattenAzureResponse(response) {
        var _a = response.request, operationResponseGetter = _a.operationResponseGetter, operationSpec = _a.operationSpec;
        return flattenResponse(response, operationResponseGetter && operationSpec && operationResponseGetter(operationSpec, response));
    }

    // Copyright (c) Microsoft Corporation. All rights reserved.
    // Licensed under the MIT License. See License.txt in the project root for license information.
    /**
     * The default language in the request header.
     *
     * @const
     * @type {string}
     */
    var DEFAULT_LANGUAGE = "en-us";
    /**
     * The ms-rest-azure version.
     * @const
     * @type {string}
     */
    var msRestAzureVersion = "1.3.7";

    // Copyright (c) Microsoft Corporation. All rights reserved.
    /**
     * @class
     * Initializes a new instance of the AzureServiceClient class.
     * @constructor
     *
     * @param {msRest.ServiceClientCredentilas} credentials - ApplicationTokenCredentials or
     * UserTokenCredentials object used for authentication.
     * @param {AzureServiceClientOptions} options - The parameter options used by AzureServiceClient
     */
    var AzureServiceClient = /** @class */ (function (_super) {
        __extends(AzureServiceClient, _super);
        function AzureServiceClient(credentials, options) {
            var _this = _super.call(this, credentials, options = updateOptionsWithDefaultValues(options)) || this;
            _this.acceptLanguage = DEFAULT_LANGUAGE;
            // For convenience, if the credentials have an associated AzureEnvironment,
            // automatically use the baseUri from that environment.
            var env = credentials.environment;
            if (env && !_this.baseUri) {
                _this.baseUri = env.resourceManagerEndpointUrl;
            }
            if (options.acceptLanguage != undefined) {
                _this.acceptLanguage = options.acceptLanguage;
            }
            if (options.longRunningOperationRetryTimeout != undefined) {
                _this.longRunningOperationRetryTimeout = options.longRunningOperationRetryTimeout;
            }
            return _this;
        }
        /**
         * Send the initial request of a LRO (long running operation) and get back an
         * LROPoller that provides methods for polling the LRO and checking if the LRO is finished.
         * @param operationArguments The arguments to the operation.
         * @param operationSpec The specification for the operation.
         * @param options Additional options to be sent while making the request.
         * @returns The LROPoller object that provides methods for interacting with the LRO.
         */
        AzureServiceClient.prototype.sendLRORequest = function (operationArguments, operationSpec, options) {
            var _this = this;
            return this.sendOperationRequest(operationArguments, operationSpec)
                .then(function (initialResponse) { return createLROPollerFromInitialResponse(_this, initialResponse._response, options); });
        };
        /**
         * Provides a mechanism to make a request that will poll and provide the final result.
         * @param {msRest.RequestPrepareOptions|msRest.WebResource} request - The request object
         * @param {AzureRequestOptionsBase} [options] Additional options to be sent while making the request
         * @returns {Promise<msRest.HttpOperationResponse>} The HttpOperationResponse containing the final polling request, response and the responseBody.
         */
        AzureServiceClient.prototype.sendLongRunningRequest = function (request, options) {
            return this.beginLongRunningRequest(request, options)
                .then(function (lroResponse) { return lroResponse.pollUntilFinished(); })
                .then(function (res) { return res._response; });
        };
        /**
         * Send the initial request of a LRO (long running operation) and get back an
         * HttpLongRunningOperationResponse that provides methods for polling the LRO and checking if the
         * LRO is finished.
         * @param {msRest.RequestPrepareOptions|msRest.WebResource} request - The request object
         * @param {AzureRequestOptionsBase} [options] Additional options to be sent while making the request
         * @returns {Promise<LROPoller>} The HttpLongRunningOperationResponse
         * that provides methods for interacting with the LRO.
         */
        AzureServiceClient.prototype.beginLongRunningRequest = function (request, options) {
            var _this = this;
            return this.sendRequest(request)
                .then(function (initialResponse) { return createLROPollerFromInitialResponse(_this, initialResponse, options); });
        };
        /**
         * Restore an LROPoller from the provided LROPollState. This method can be used to recreate an
         * LROPoller on a different process or machine.
         */
        AzureServiceClient.prototype.restoreLROPoller = function (lroPollState) {
            return createLROPollerFromPollState(this, lroPollState);
        };
        return AzureServiceClient;
    }(ServiceClient));
    function getDefaultUserAgentValue$1() {
        var defaultUserAgent = getDefaultUserAgentValue();
        return "ms-rest-azure-js/" + msRestAzureVersion + " " + defaultUserAgent;
    }
    function updateOptionsWithDefaultValues(options) {
        if (!options) {
            options = {};
        }
        if (options.generateClientRequestIdHeader == undefined) {
            options.generateClientRequestIdHeader = true;
        }
        if (!options.userAgent) {
            options.userAgent = getDefaultUserAgentValue$1();
        }
        return options;
    }

    // Copyright (c) Microsoft Corporation. All rights reserved.
    // Licensed under the MIT License. See License.txt in the project root for license information.
    var CloudErrorMapper = {
        serializedName: "CloudError",
        type: {
            name: "Composite",
            className: "CloudError",
            modelProperties: {
                code: {
                    required: true,
                    serializedName: "code",
                    type: {
                        name: "String"
                    }
                },
                message: {
                    required: true,
                    serializedName: "message",
                    type: {
                        name: "String"
                    }
                },
                target: {
                    serializedName: "target",
                    type: {
                        name: "String"
                    }
                },
                details: {
                    serializedName: "details",
                    type: {
                        name: "Sequence",
                        element: {
                            serializedName: "CloudErrorElementType",
                            type: {
                                name: "Composite",
                                className: "CloudError"
                            }
                        }
                    }
                },
                innerError: {
                    required: false,
                    serializedName: "innererror",
                    type: {
                        name: "Object"
                    }
                },
                additionalInfo: {
                    required: false,
                    serializedName: "additionalInfo",
                    type: {
                        name: "Composite",
                        className: "AdditionalInfoElement",
                        modelProperties: {
                            type: {
                                required: true,
                                serializedName: "type",
                                type: {
                                    name: "String"
                                }
                            },
                            info: {
                                required: false,
                                serializedName: "info",
                                type: {
                                    name: "Object"
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    /*
     * Code generated by Microsoft (R) AutoRest Code Generator.
     * Changes may cause incorrect behavior and will be lost if the code is regenerated.
     */
    var CloudError = CloudErrorMapper;
    var BatchResponseSummary = {
        serializedName: "BatchResponse_summary",
        type: {
            name: "Composite",
            className: "BatchResponseSummary",
            modelProperties: {
                successfulRequests: {
                    readOnly: true,
                    serializedName: "successfulRequests",
                    type: {
                        name: "Number"
                    }
                },
                totalRequests: {
                    readOnly: true,
                    serializedName: "totalRequests",
                    type: {
                        name: "Number"
                    }
                }
            }
        }
    };
    var BatchResponse = {
        serializedName: "BatchResponse",
        type: {
            name: "Composite",
            className: "BatchResponse",
            modelProperties: {
                summary: {
                    readOnly: true,
                    serializedName: "summary",
                    type: {
                        name: "Composite",
                        className: "BatchResponseSummary"
                    }
                },
                batchItems: {
                    readOnly: true,
                    serializedName: "batchItems",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Object"
                            }
                        }
                    }
                }
            }
        }
    };
    var BatchRequestBodyBatchItemsItem = {
        serializedName: "BatchRequestBody_batchItemsItem",
        type: {
            name: "Composite",
            className: "BatchRequestBodyBatchItemsItem",
            modelProperties: {
                query: {
                    serializedName: "query",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var BatchRequestBody = {
        serializedName: "BatchRequestBody",
        type: {
            name: "Composite",
            className: "BatchRequestBody",
            modelProperties: {
                batchItems: {
                    serializedName: "batchItems",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "BatchRequestBodyBatchItemsItem"
                            }
                        }
                    }
                }
            }
        }
    };
    var CoordinateAbbreviated = {
        serializedName: "CoordinateAbbreviated",
        type: {
            name: "Composite",
            className: "CoordinateAbbreviated",
            modelProperties: {
                lat: {
                    readOnly: true,
                    serializedName: "lat",
                    type: {
                        name: "Number"
                    }
                },
                lon: {
                    readOnly: true,
                    serializedName: "lon",
                    type: {
                        name: "Number"
                    }
                }
            }
        }
    };
    var GeoJSONGeometry = {
        serializedName: "GeoJSONGeometry",
        type: {
            name: "Composite",
            polymorphicDiscriminator: {
                serializedName: "type",
                clientName: "type"
            },
            uberParent: "GeoJSONGeometry",
            className: "GeoJSONGeometry",
            modelProperties: {
                type: {
                    required: true,
                    serializedName: "type",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var LineString = {
        serializedName: "LineString",
        type: {
            name: "Composite",
            polymorphicDiscriminator: GeoJSONGeometry.type.polymorphicDiscriminator,
            uberParent: "GeoJSONGeometry",
            className: "LineString",
            modelProperties: __assign(__assign({}, GeoJSONGeometry.type.modelProperties), { coordinates: {
                    required: true,
                    serializedName: "coordinates",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Sequence",
                                element: {
                                    type: {
                                        name: "Number"
                                    }
                                }
                            }
                        }
                    }
                } })
        }
    };
    var SearchPolygonResult = {
        serializedName: "SearchPolygonResult",
        type: {
            name: "Composite",
            className: "SearchPolygonResult",
            modelProperties: {
                providerID: {
                    readOnly: true,
                    serializedName: "providerID",
                    type: {
                        name: "String"
                    }
                },
                error: {
                    readOnly: true,
                    serializedName: "error",
                    type: {
                        name: "String"
                    }
                },
                geometryData: {
                    serializedName: "geometryData",
                    type: {
                        name: "Object"
                    }
                }
            }
        }
    };
    var SearchPolygonResponse = {
        serializedName: "SearchPolygonResponse",
        type: {
            name: "Composite",
            className: "SearchPolygonResponse",
            modelProperties: {
                additionalData: {
                    readOnly: true,
                    serializedName: "additionalData",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "SearchPolygonResult"
                            }
                        }
                    }
                }
            }
        }
    };
    var SearchFuzzySummary = {
        serializedName: "SearchFuzzySummary",
        type: {
            name: "Composite",
            className: "SearchFuzzySummary",
            modelProperties: {
                query: {
                    readOnly: true,
                    serializedName: "query",
                    type: {
                        name: "String"
                    }
                },
                queryType: {
                    readOnly: true,
                    serializedName: "queryType",
                    type: {
                        name: "String"
                    }
                },
                queryTime: {
                    readOnly: true,
                    serializedName: "queryTime",
                    type: {
                        name: "Number"
                    }
                },
                numResults: {
                    readOnly: true,
                    serializedName: "numResults",
                    type: {
                        name: "Number"
                    }
                },
                offset: {
                    readOnly: true,
                    serializedName: "offset",
                    type: {
                        name: "Number"
                    }
                },
                totalResults: {
                    readOnly: true,
                    serializedName: "totalResults",
                    type: {
                        name: "Number"
                    }
                },
                fuzzyLevel: {
                    readOnly: true,
                    serializedName: "fuzzyLevel",
                    type: {
                        name: "Number"
                    }
                }
            }
        }
    };
    var SearchResultPoiClassificationName = {
        serializedName: "SearchResultPoiClassificationName",
        type: {
            name: "Composite",
            className: "SearchResultPoiClassificationName",
            modelProperties: {
                nameLocale: {
                    readOnly: true,
                    serializedName: "nameLocale",
                    type: {
                        name: "String"
                    }
                },
                name: {
                    readOnly: true,
                    serializedName: "name",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var SearchResultPoiClassification = {
        serializedName: "SearchResultPoiClassification",
        type: {
            name: "Composite",
            className: "SearchResultPoiClassification",
            modelProperties: {
                code: {
                    readOnly: true,
                    serializedName: "code",
                    type: {
                        name: "String"
                    }
                },
                names: {
                    readOnly: true,
                    serializedName: "names",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "SearchResultPoiClassificationName"
                            }
                        }
                    }
                }
            }
        }
    };
    var SearchResultPoiBrand = {
        serializedName: "SearchResultPoiBrand",
        type: {
            name: "Composite",
            className: "SearchResultPoiBrand",
            modelProperties: {
                name: {
                    readOnly: true,
                    serializedName: "name",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var SearchResultPoi = {
        serializedName: "SearchResultPoi",
        type: {
            name: "Composite",
            className: "SearchResultPoi",
            modelProperties: {
                name: {
                    readOnly: true,
                    serializedName: "name",
                    type: {
                        name: "String"
                    }
                },
                phone: {
                    readOnly: true,
                    serializedName: "phone",
                    type: {
                        name: "String"
                    }
                },
                url: {
                    readOnly: true,
                    serializedName: "url",
                    type: {
                        name: "String"
                    }
                },
                categories: {
                    readOnly: true,
                    serializedName: "categories",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "String"
                            }
                        }
                    }
                },
                classifications: {
                    readOnly: true,
                    serializedName: "classifications",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "SearchResultPoiClassification"
                            }
                        }
                    }
                },
                brands: {
                    readOnly: true,
                    serializedName: "brands",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "SearchResultPoiBrand"
                            }
                        }
                    }
                }
            }
        }
    };
    var SearchResultAddress = {
        serializedName: "SearchResultAddress",
        type: {
            name: "Composite",
            className: "SearchResultAddress",
            modelProperties: {
                buildingNumber: {
                    readOnly: true,
                    serializedName: "buildingNumber",
                    type: {
                        name: "String"
                    }
                },
                street: {
                    readOnly: true,
                    serializedName: "street",
                    type: {
                        name: "String"
                    }
                },
                crossStreet: {
                    readOnly: true,
                    serializedName: "crossStreet",
                    type: {
                        name: "String"
                    }
                },
                streetNumber: {
                    readOnly: true,
                    serializedName: "streetNumber",
                    type: {
                        name: "String"
                    }
                },
                routeNumbers: {
                    readOnly: true,
                    serializedName: "routeNumbers",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Number"
                            }
                        }
                    }
                },
                streetName: {
                    readOnly: true,
                    serializedName: "streetName",
                    type: {
                        name: "String"
                    }
                },
                streetNameAndNumber: {
                    readOnly: true,
                    serializedName: "streetNameAndNumber",
                    type: {
                        name: "String"
                    }
                },
                municipality: {
                    readOnly: true,
                    serializedName: "municipality",
                    type: {
                        name: "String"
                    }
                },
                municipalitySubdivision: {
                    readOnly: true,
                    serializedName: "municipalitySubdivision",
                    type: {
                        name: "String"
                    }
                },
                countryTertiarySubdivision: {
                    readOnly: true,
                    serializedName: "countryTertiarySubdivision",
                    type: {
                        name: "String"
                    }
                },
                countrySecondarySubdivision: {
                    readOnly: true,
                    serializedName: "countrySecondarySubdivision",
                    type: {
                        name: "String"
                    }
                },
                countrySubdivision: {
                    readOnly: true,
                    serializedName: "countrySubdivision",
                    type: {
                        name: "String"
                    }
                },
                postalCode: {
                    readOnly: true,
                    serializedName: "postalCode",
                    type: {
                        name: "String"
                    }
                },
                extendedPostalCode: {
                    readOnly: true,
                    serializedName: "extendedPostalCode",
                    type: {
                        name: "String"
                    }
                },
                countryCode: {
                    readOnly: true,
                    serializedName: "countryCode",
                    type: {
                        name: "String"
                    }
                },
                country: {
                    readOnly: true,
                    serializedName: "country",
                    type: {
                        name: "String"
                    }
                },
                countryCodeISO3: {
                    readOnly: true,
                    serializedName: "countryCodeISO3",
                    type: {
                        name: "String"
                    }
                },
                freeformAddress: {
                    readOnly: true,
                    serializedName: "freeformAddress",
                    type: {
                        name: "String"
                    }
                },
                countrySubdivisionName: {
                    readOnly: true,
                    serializedName: "countrySubdivisionName",
                    type: {
                        name: "String"
                    }
                },
                localName: {
                    readOnly: true,
                    serializedName: "localName",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var SearchResultViewport = {
        serializedName: "SearchResultViewport",
        type: {
            name: "Composite",
            className: "SearchResultViewport",
            modelProperties: {
                topLeftPoint: {
                    serializedName: "topLeftPoint",
                    type: {
                        name: "Composite",
                        className: "CoordinateAbbreviated"
                    }
                },
                btmRightPoint: {
                    serializedName: "btmRightPoint",
                    type: {
                        name: "Composite",
                        className: "CoordinateAbbreviated"
                    }
                }
            }
        }
    };
    var SearchResultEntryPoint = {
        serializedName: "SearchResultEntryPoint",
        type: {
            name: "Composite",
            className: "SearchResultEntryPoint",
            modelProperties: {
                type: {
                    readOnly: true,
                    serializedName: "type",
                    type: {
                        name: "String"
                    }
                },
                position: {
                    serializedName: "position",
                    type: {
                        name: "Composite",
                        className: "CoordinateAbbreviated"
                    }
                }
            }
        }
    };
    var SearchResultAddressRanges = {
        serializedName: "SearchResultAddressRanges",
        type: {
            name: "Composite",
            className: "SearchResultAddressRanges",
            modelProperties: {
                rangeLeft: {
                    serializedName: "rangeLeft",
                    type: {
                        name: "String"
                    }
                },
                rangeRight: {
                    serializedName: "rangeRight",
                    type: {
                        name: "String"
                    }
                },
                from: {
                    serializedName: "from",
                    type: {
                        name: "Composite",
                        className: "CoordinateAbbreviated"
                    }
                },
                to: {
                    serializedName: "to",
                    type: {
                        name: "Composite",
                        className: "CoordinateAbbreviated"
                    }
                }
            }
        }
    };
    var DataSourcesGeometry = {
        serializedName: "DataSourcesGeometry",
        type: {
            name: "Composite",
            className: "DataSourcesGeometry",
            modelProperties: {
                id: {
                    readOnly: true,
                    serializedName: "id",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var DataSources = {
        serializedName: "DataSources",
        type: {
            name: "Composite",
            className: "DataSources",
            modelProperties: {
                geometry: {
                    serializedName: "geometry",
                    type: {
                        name: "Composite",
                        className: "DataSourcesGeometry"
                    }
                }
            }
        }
    };
    var SearchFuzzyResult = {
        serializedName: "SearchFuzzyResult",
        type: {
            name: "Composite",
            className: "SearchFuzzyResult",
            modelProperties: {
                type: {
                    readOnly: true,
                    serializedName: "type",
                    type: {
                        name: "String"
                    }
                },
                id: {
                    readOnly: true,
                    serializedName: "id",
                    type: {
                        name: "String"
                    }
                },
                score: {
                    serializedName: "score",
                    type: {
                        name: "Number"
                    }
                },
                info: {
                    readOnly: true,
                    serializedName: "info",
                    type: {
                        name: "String"
                    }
                },
                entityType: {
                    serializedName: "entityType",
                    type: {
                        name: "Enum",
                        allowedValues: [
                            "Country",
                            "CountrySubdivision",
                            "CountrySecondarySubdivision",
                            "CountryTertiarySubdivision",
                            "Municipality",
                            "MunicipalitySubdivision",
                            "Neighbourhood",
                            "PostalCodeArea"
                        ]
                    }
                },
                poi: {
                    serializedName: "poi",
                    type: {
                        name: "Composite",
                        className: "SearchResultPoi"
                    }
                },
                address: {
                    serializedName: "address",
                    type: {
                        name: "Composite",
                        className: "SearchResultAddress"
                    }
                },
                position: {
                    serializedName: "position",
                    type: {
                        name: "Composite",
                        className: "CoordinateAbbreviated"
                    }
                },
                viewport: {
                    serializedName: "viewport",
                    type: {
                        name: "Composite",
                        className: "SearchResultViewport"
                    }
                },
                entryPoints: {
                    serializedName: "entryPoints",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "SearchResultEntryPoint"
                            }
                        }
                    }
                },
                addressRanges: {
                    serializedName: "addressRanges",
                    type: {
                        name: "Composite",
                        className: "SearchResultAddressRanges"
                    }
                },
                dataSources: {
                    serializedName: "dataSources",
                    type: {
                        name: "Composite",
                        className: "DataSources"
                    }
                }
            }
        }
    };
    var SearchFuzzyResponse = {
        serializedName: "SearchFuzzyResponse",
        type: {
            name: "Composite",
            className: "SearchFuzzyResponse",
            modelProperties: {
                summary: {
                    serializedName: "summary",
                    type: {
                        name: "Composite",
                        className: "SearchFuzzySummary"
                    }
                },
                results: {
                    readOnly: true,
                    serializedName: "results",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "SearchFuzzyResult"
                            }
                        }
                    }
                }
            }
        }
    };
    var SearchSummaryGeoBias = {
        serializedName: "SearchSummaryGeoBias",
        type: {
            name: "Composite",
            className: "SearchSummaryGeoBias",
            modelProperties: {
                lat: {
                    readOnly: true,
                    serializedName: "lat",
                    type: {
                        name: "Number"
                    }
                },
                lon: {
                    readOnly: true,
                    serializedName: "lon",
                    type: {
                        name: "Number"
                    }
                }
            }
        }
    };
    var SearchPoiSummary = {
        serializedName: "SearchPoiSummary",
        type: {
            name: "Composite",
            className: "SearchPoiSummary",
            modelProperties: {
                query: {
                    readOnly: true,
                    serializedName: "query",
                    type: {
                        name: "String"
                    }
                },
                queryType: {
                    readOnly: true,
                    serializedName: "queryType",
                    type: {
                        name: "String"
                    }
                },
                queryTime: {
                    readOnly: true,
                    serializedName: "queryTime",
                    type: {
                        name: "Number"
                    }
                },
                numResults: {
                    readOnly: true,
                    serializedName: "numResults",
                    type: {
                        name: "Number"
                    }
                },
                offset: {
                    readOnly: true,
                    serializedName: "offset",
                    type: {
                        name: "Number"
                    }
                },
                totalResults: {
                    readOnly: true,
                    serializedName: "totalResults",
                    type: {
                        name: "Number"
                    }
                },
                fuzzyLevel: {
                    readOnly: true,
                    serializedName: "fuzzyLevel",
                    type: {
                        name: "Number"
                    }
                },
                geoBias: {
                    serializedName: "geoBias",
                    type: {
                        name: "Composite",
                        className: "SearchSummaryGeoBias"
                    }
                }
            }
        }
    };
    var SearchPoiResult = {
        serializedName: "SearchPoiResult",
        type: {
            name: "Composite",
            className: "SearchPoiResult",
            modelProperties: {
                type: {
                    readOnly: true,
                    serializedName: "type",
                    type: {
                        name: "String"
                    }
                },
                id: {
                    readOnly: true,
                    serializedName: "id",
                    type: {
                        name: "String"
                    }
                },
                score: {
                    serializedName: "score",
                    type: {
                        name: "Number"
                    }
                },
                dist: {
                    serializedName: "dist",
                    type: {
                        name: "Number"
                    }
                },
                info: {
                    readOnly: true,
                    serializedName: "info",
                    type: {
                        name: "String"
                    }
                },
                entityType: {
                    serializedName: "entityType",
                    type: {
                        name: "Enum",
                        allowedValues: [
                            "Country",
                            "CountrySubdivision",
                            "CountrySecondarySubdivision",
                            "CountryTertiarySubdivision",
                            "Municipality",
                            "MunicipalitySubdivision",
                            "Neighbourhood",
                            "PostalCodeArea"
                        ]
                    }
                },
                poi: {
                    serializedName: "poi",
                    type: {
                        name: "Composite",
                        className: "SearchResultPoi"
                    }
                },
                address: {
                    serializedName: "address",
                    type: {
                        name: "Composite",
                        className: "SearchResultAddress"
                    }
                },
                position: {
                    serializedName: "position",
                    type: {
                        name: "Composite",
                        className: "CoordinateAbbreviated"
                    }
                },
                viewport: {
                    serializedName: "viewport",
                    type: {
                        name: "Composite",
                        className: "SearchResultViewport"
                    }
                },
                entryPoints: {
                    serializedName: "entryPoints",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "SearchResultEntryPoint"
                            }
                        }
                    }
                }
            }
        }
    };
    var SearchPoiResponse = {
        serializedName: "SearchPoiResponse",
        type: {
            name: "Composite",
            className: "SearchPoiResponse",
            modelProperties: {
                summary: {
                    serializedName: "summary",
                    type: {
                        name: "Composite",
                        className: "SearchPoiSummary"
                    }
                },
                results: {
                    readOnly: true,
                    serializedName: "results",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "SearchPoiResult"
                            }
                        }
                    }
                }
            }
        }
    };
    var SearchNearbySummary = {
        serializedName: "SearchNearbySummary",
        type: {
            name: "Composite",
            className: "SearchNearbySummary",
            modelProperties: {
                queryType: {
                    readOnly: true,
                    serializedName: "queryType",
                    type: {
                        name: "String"
                    }
                },
                queryTime: {
                    readOnly: true,
                    serializedName: "queryTime",
                    type: {
                        name: "Number"
                    }
                },
                numResults: {
                    readOnly: true,
                    serializedName: "numResults",
                    type: {
                        name: "Number"
                    }
                },
                offset: {
                    readOnly: true,
                    serializedName: "offset",
                    type: {
                        name: "Number"
                    }
                },
                totalResults: {
                    readOnly: true,
                    serializedName: "totalResults",
                    type: {
                        name: "Number"
                    }
                },
                fuzzyLevel: {
                    readOnly: true,
                    serializedName: "fuzzyLevel",
                    type: {
                        name: "Number"
                    }
                },
                geoBias: {
                    serializedName: "geoBias",
                    type: {
                        name: "Composite",
                        className: "SearchSummaryGeoBias"
                    }
                }
            }
        }
    };
    var SearchNearbyResult = {
        serializedName: "SearchNearbyResult",
        type: {
            name: "Composite",
            className: "SearchNearbyResult",
            modelProperties: {
                type: {
                    readOnly: true,
                    serializedName: "type",
                    type: {
                        name: "String"
                    }
                },
                id: {
                    readOnly: true,
                    serializedName: "id",
                    type: {
                        name: "String"
                    }
                },
                score: {
                    serializedName: "score",
                    type: {
                        name: "Number"
                    }
                },
                dist: {
                    serializedName: "dist",
                    type: {
                        name: "Number"
                    }
                },
                info: {
                    readOnly: true,
                    serializedName: "info",
                    type: {
                        name: "String"
                    }
                },
                poi: {
                    serializedName: "poi",
                    type: {
                        name: "Composite",
                        className: "SearchResultPoi"
                    }
                },
                address: {
                    serializedName: "address",
                    type: {
                        name: "Composite",
                        className: "SearchResultAddress"
                    }
                },
                position: {
                    serializedName: "position",
                    type: {
                        name: "Composite",
                        className: "CoordinateAbbreviated"
                    }
                },
                viewport: {
                    serializedName: "viewport",
                    type: {
                        name: "Composite",
                        className: "SearchResultViewport"
                    }
                },
                entryPoints: {
                    serializedName: "entryPoints",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "SearchResultEntryPoint"
                            }
                        }
                    }
                }
            }
        }
    };
    var SearchNearbyResponse = {
        serializedName: "SearchNearbyResponse",
        type: {
            name: "Composite",
            className: "SearchNearbyResponse",
            modelProperties: {
                summary: {
                    serializedName: "summary",
                    type: {
                        name: "Composite",
                        className: "SearchNearbySummary"
                    }
                },
                results: {
                    readOnly: true,
                    serializedName: "results",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "SearchNearbyResult"
                            }
                        }
                    }
                }
            }
        }
    };
    var SearchPoiCategorySummary = {
        serializedName: "SearchPoiCategorySummary",
        type: {
            name: "Composite",
            className: "SearchPoiCategorySummary",
            modelProperties: {
                query: {
                    readOnly: true,
                    serializedName: "query",
                    type: {
                        name: "String"
                    }
                },
                queryType: {
                    readOnly: true,
                    serializedName: "queryType",
                    type: {
                        name: "String"
                    }
                },
                queryTime: {
                    readOnly: true,
                    serializedName: "queryTime",
                    type: {
                        name: "Number"
                    }
                },
                numResults: {
                    readOnly: true,
                    serializedName: "numResults",
                    type: {
                        name: "Number"
                    }
                },
                offset: {
                    readOnly: true,
                    serializedName: "offset",
                    type: {
                        name: "Number"
                    }
                },
                totalResults: {
                    readOnly: true,
                    serializedName: "totalResults",
                    type: {
                        name: "Number"
                    }
                },
                fuzzyLevel: {
                    readOnly: true,
                    serializedName: "fuzzyLevel",
                    type: {
                        name: "Number"
                    }
                },
                geoBias: {
                    serializedName: "geoBias",
                    type: {
                        name: "Composite",
                        className: "SearchSummaryGeoBias"
                    }
                }
            }
        }
    };
    var SearchPoiCategoryResult = {
        serializedName: "SearchPoiCategoryResult",
        type: {
            name: "Composite",
            className: "SearchPoiCategoryResult",
            modelProperties: {
                type: {
                    readOnly: true,
                    serializedName: "type",
                    type: {
                        name: "String"
                    }
                },
                id: {
                    readOnly: true,
                    serializedName: "id",
                    type: {
                        name: "String"
                    }
                },
                score: {
                    serializedName: "score",
                    type: {
                        name: "Number"
                    }
                },
                dist: {
                    serializedName: "dist",
                    type: {
                        name: "Number"
                    }
                },
                info: {
                    readOnly: true,
                    serializedName: "info",
                    type: {
                        name: "String"
                    }
                },
                entityType: {
                    serializedName: "entityType",
                    type: {
                        name: "Enum",
                        allowedValues: [
                            "Country",
                            "CountrySubdivision",
                            "CountrySecondarySubdivision",
                            "CountryTertiarySubdivision",
                            "Municipality",
                            "MunicipalitySubdivision",
                            "Neighbourhood",
                            "PostalCodeArea"
                        ]
                    }
                },
                poi: {
                    serializedName: "poi",
                    type: {
                        name: "Composite",
                        className: "SearchResultPoi"
                    }
                },
                address: {
                    serializedName: "address",
                    type: {
                        name: "Composite",
                        className: "SearchResultAddress"
                    }
                },
                position: {
                    serializedName: "position",
                    type: {
                        name: "Composite",
                        className: "CoordinateAbbreviated"
                    }
                },
                viewport: {
                    serializedName: "viewport",
                    type: {
                        name: "Composite",
                        className: "SearchResultViewport"
                    }
                },
                entryPoints: {
                    serializedName: "entryPoints",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "SearchResultEntryPoint"
                            }
                        }
                    }
                }
            }
        }
    };
    var SearchPoiCategoryResponse = {
        serializedName: "SearchPoiCategoryResponse",
        type: {
            name: "Composite",
            className: "SearchPoiCategoryResponse",
            modelProperties: {
                summary: {
                    serializedName: "summary",
                    type: {
                        name: "Composite",
                        className: "SearchPoiCategorySummary"
                    }
                },
                results: {
                    readOnly: true,
                    serializedName: "results",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "SearchPoiCategoryResult"
                            }
                        }
                    }
                }
            }
        }
    };
    var SearchAddressSummary = {
        serializedName: "SearchAddressSummary",
        type: {
            name: "Composite",
            className: "SearchAddressSummary",
            modelProperties: {
                query: {
                    readOnly: true,
                    serializedName: "query",
                    type: {
                        name: "String"
                    }
                },
                queryType: {
                    readOnly: true,
                    serializedName: "queryType",
                    type: {
                        name: "String"
                    }
                },
                queryTime: {
                    readOnly: true,
                    serializedName: "queryTime",
                    type: {
                        name: "Number"
                    }
                },
                numResults: {
                    readOnly: true,
                    serializedName: "numResults",
                    type: {
                        name: "Number"
                    }
                },
                offset: {
                    readOnly: true,
                    serializedName: "offset",
                    type: {
                        name: "Number"
                    }
                },
                totalResults: {
                    readOnly: true,
                    serializedName: "totalResults",
                    type: {
                        name: "Number"
                    }
                },
                fuzzyLevel: {
                    readOnly: true,
                    serializedName: "fuzzyLevel",
                    type: {
                        name: "Number"
                    }
                }
            }
        }
    };
    var SearchAddressResult = {
        serializedName: "SearchAddressResult",
        type: {
            name: "Composite",
            className: "SearchAddressResult",
            modelProperties: {
                type: {
                    readOnly: true,
                    serializedName: "type",
                    type: {
                        name: "String"
                    }
                },
                id: {
                    readOnly: true,
                    serializedName: "id",
                    type: {
                        name: "String"
                    }
                },
                score: {
                    serializedName: "score",
                    type: {
                        name: "Number"
                    }
                },
                address: {
                    serializedName: "address",
                    type: {
                        name: "Composite",
                        className: "SearchResultAddress"
                    }
                },
                position: {
                    serializedName: "position",
                    type: {
                        name: "Composite",
                        className: "CoordinateAbbreviated"
                    }
                },
                viewport: {
                    serializedName: "viewport",
                    type: {
                        name: "Composite",
                        className: "SearchResultViewport"
                    }
                },
                entryPoints: {
                    serializedName: "entryPoints",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "SearchResultEntryPoint"
                            }
                        }
                    }
                },
                dataSources: {
                    serializedName: "dataSources",
                    type: {
                        name: "Composite",
                        className: "DataSources"
                    }
                }
            }
        }
    };
    var SearchAddressResponse = {
        serializedName: "SearchAddressResponse",
        type: {
            name: "Composite",
            className: "SearchAddressResponse",
            modelProperties: {
                summary: {
                    serializedName: "summary",
                    type: {
                        name: "Composite",
                        className: "SearchAddressSummary"
                    }
                },
                results: {
                    readOnly: true,
                    serializedName: "results",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "SearchAddressResult"
                            }
                        }
                    }
                }
            }
        }
    };
    var SearchAddressReverseSummary = {
        serializedName: "SearchAddressReverseSummary",
        type: {
            name: "Composite",
            className: "SearchAddressReverseSummary",
            modelProperties: {
                queryTime: {
                    readOnly: true,
                    serializedName: "queryTime",
                    type: {
                        name: "Number"
                    }
                },
                numResults: {
                    readOnly: true,
                    serializedName: "numResults",
                    type: {
                        name: "Number"
                    }
                }
            }
        }
    };
    var SearchAddressReverseResult = {
        serializedName: "SearchAddressReverseResult",
        type: {
            name: "Composite",
            className: "SearchAddressReverseResult",
            modelProperties: {
                address: {
                    serializedName: "address",
                    type: {
                        name: "Composite",
                        className: "SearchResultAddress"
                    }
                },
                position: {
                    readOnly: true,
                    serializedName: "position",
                    type: {
                        name: "String"
                    }
                },
                matchType: {
                    readOnly: true,
                    serializedName: "matchType",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var SearchAddressReverseResponse = {
        serializedName: "SearchAddressReverseResponse",
        type: {
            name: "Composite",
            className: "SearchAddressReverseResponse",
            modelProperties: {
                summary: {
                    serializedName: "summary",
                    type: {
                        name: "Composite",
                        className: "SearchAddressReverseSummary"
                    }
                },
                addresses: {
                    readOnly: true,
                    serializedName: "addresses",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "SearchAddressReverseResult"
                            }
                        }
                    }
                }
            }
        }
    };
    var SearchAddressReverseCrossStreetSummary = {
        serializedName: "SearchAddressReverseCrossStreetSummary",
        type: {
            name: "Composite",
            className: "SearchAddressReverseCrossStreetSummary",
            modelProperties: {
                queryTime: {
                    readOnly: true,
                    serializedName: "queryTime",
                    type: {
                        name: "Number"
                    }
                },
                numResults: {
                    readOnly: true,
                    serializedName: "numResults",
                    type: {
                        name: "Number"
                    }
                }
            }
        }
    };
    var SearchAddressReverseCrossStreetResult = {
        serializedName: "SearchAddressReverseCrossStreetResult",
        type: {
            name: "Composite",
            className: "SearchAddressReverseCrossStreetResult",
            modelProperties: {
                address: {
                    serializedName: "address",
                    type: {
                        name: "Composite",
                        className: "SearchResultAddress"
                    }
                },
                position: {
                    readOnly: true,
                    serializedName: "position",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var SearchAddressReverseCrossStreetResponse = {
        serializedName: "SearchAddressReverseCrossStreetResponse",
        type: {
            name: "Composite",
            className: "SearchAddressReverseCrossStreetResponse",
            modelProperties: {
                summary: {
                    serializedName: "summary",
                    type: {
                        name: "Composite",
                        className: "SearchAddressReverseCrossStreetSummary"
                    }
                },
                addresses: {
                    readOnly: true,
                    serializedName: "addresses",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "SearchAddressReverseCrossStreetResult"
                            }
                        }
                    }
                }
            }
        }
    };
    var SearchAddressStructuredSummary = {
        serializedName: "SearchAddressStructuredSummary",
        type: {
            name: "Composite",
            className: "SearchAddressStructuredSummary",
            modelProperties: {
                query: {
                    readOnly: true,
                    serializedName: "query",
                    type: {
                        name: "String"
                    }
                },
                queryType: {
                    readOnly: true,
                    serializedName: "queryType",
                    type: {
                        name: "String"
                    }
                },
                queryTime: {
                    readOnly: true,
                    serializedName: "queryTime",
                    type: {
                        name: "Number"
                    }
                },
                numResults: {
                    readOnly: true,
                    serializedName: "numResults",
                    type: {
                        name: "Number"
                    }
                },
                limit: {
                    readOnly: true,
                    serializedName: "limit",
                    type: {
                        name: "Number"
                    }
                },
                offset: {
                    readOnly: true,
                    serializedName: "offset",
                    type: {
                        name: "Number"
                    }
                },
                totalResults: {
                    readOnly: true,
                    serializedName: "totalResults",
                    type: {
                        name: "Number"
                    }
                },
                fuzzyLevel: {
                    readOnly: true,
                    serializedName: "fuzzyLevel",
                    type: {
                        name: "Number"
                    }
                },
                geoBias: {
                    serializedName: "geoBias",
                    type: {
                        name: "Composite",
                        className: "SearchSummaryGeoBias"
                    }
                }
            }
        }
    };
    var SearchAddressStructuredResult = {
        serializedName: "SearchAddressStructuredResult",
        type: {
            name: "Composite",
            className: "SearchAddressStructuredResult",
            modelProperties: {
                type: {
                    readOnly: true,
                    serializedName: "type",
                    type: {
                        name: "String"
                    }
                },
                id: {
                    readOnly: true,
                    serializedName: "id",
                    type: {
                        name: "String"
                    }
                },
                score: {
                    serializedName: "score",
                    type: {
                        name: "Number"
                    }
                },
                dist: {
                    serializedName: "dist",
                    type: {
                        name: "Number"
                    }
                },
                address: {
                    serializedName: "address",
                    type: {
                        name: "Composite",
                        className: "SearchResultAddress"
                    }
                },
                position: {
                    serializedName: "position",
                    type: {
                        name: "Composite",
                        className: "CoordinateAbbreviated"
                    }
                },
                viewport: {
                    serializedName: "viewport",
                    type: {
                        name: "Composite",
                        className: "SearchResultViewport"
                    }
                },
                entryPoints: {
                    serializedName: "entryPoints",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "SearchResultEntryPoint"
                            }
                        }
                    }
                },
                addressRanges: {
                    serializedName: "addressRanges",
                    type: {
                        name: "Composite",
                        className: "SearchResultAddressRanges"
                    }
                }
            }
        }
    };
    var SearchAddressStructuredResponse = {
        serializedName: "SearchAddressStructuredResponse",
        type: {
            name: "Composite",
            className: "SearchAddressStructuredResponse",
            modelProperties: {
                summary: {
                    serializedName: "summary",
                    type: {
                        name: "Composite",
                        className: "SearchAddressStructuredSummary"
                    }
                },
                results: {
                    readOnly: true,
                    serializedName: "results",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "SearchAddressStructuredResult"
                            }
                        }
                    }
                }
            }
        }
    };
    var SearchGeometrySummary = {
        serializedName: "SearchGeometrySummary",
        type: {
            name: "Composite",
            className: "SearchGeometrySummary",
            modelProperties: {
                query: {
                    readOnly: true,
                    serializedName: "query",
                    type: {
                        name: "String"
                    }
                },
                queryType: {
                    readOnly: true,
                    serializedName: "queryType",
                    type: {
                        name: "String"
                    }
                },
                queryTime: {
                    readOnly: true,
                    serializedName: "queryTime",
                    type: {
                        name: "Number"
                    }
                },
                numResults: {
                    readOnly: true,
                    serializedName: "numResults",
                    type: {
                        name: "Number"
                    }
                },
                offset: {
                    readOnly: true,
                    serializedName: "offset",
                    type: {
                        name: "Number"
                    }
                },
                totalResults: {
                    readOnly: true,
                    serializedName: "totalResults",
                    type: {
                        name: "Number"
                    }
                },
                fuzzyLevel: {
                    readOnly: true,
                    serializedName: "fuzzyLevel",
                    type: {
                        name: "Number"
                    }
                }
            }
        }
    };
    var SearchGeometryResult = {
        serializedName: "SearchGeometryResult",
        type: {
            name: "Composite",
            className: "SearchGeometryResult",
            modelProperties: {
                type: {
                    readOnly: true,
                    serializedName: "type",
                    type: {
                        name: "String"
                    }
                },
                id: {
                    readOnly: true,
                    serializedName: "id",
                    type: {
                        name: "String"
                    }
                },
                score: {
                    serializedName: "score",
                    type: {
                        name: "Number"
                    }
                },
                info: {
                    readOnly: true,
                    serializedName: "info",
                    type: {
                        name: "String"
                    }
                },
                entityType: {
                    serializedName: "entityType",
                    type: {
                        name: "Enum",
                        allowedValues: [
                            "Country",
                            "CountrySubdivision",
                            "CountrySecondarySubdivision",
                            "CountryTertiarySubdivision",
                            "Municipality",
                            "MunicipalitySubdivision",
                            "Neighbourhood",
                            "PostalCodeArea"
                        ]
                    }
                },
                poi: {
                    serializedName: "poi",
                    type: {
                        name: "Composite",
                        className: "SearchResultPoi"
                    }
                },
                address: {
                    serializedName: "address",
                    type: {
                        name: "Composite",
                        className: "SearchResultAddress"
                    }
                },
                position: {
                    serializedName: "position",
                    type: {
                        name: "Composite",
                        className: "CoordinateAbbreviated"
                    }
                },
                viewport: {
                    serializedName: "viewport",
                    type: {
                        name: "Composite",
                        className: "SearchResultViewport"
                    }
                },
                entryPoints: {
                    serializedName: "entryPoints",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "SearchResultEntryPoint"
                            }
                        }
                    }
                }
            }
        }
    };
    var SearchGeometryResponse = {
        serializedName: "SearchGeometryResponse",
        type: {
            name: "Composite",
            className: "SearchGeometryResponse",
            modelProperties: {
                summary: {
                    serializedName: "summary",
                    type: {
                        name: "Composite",
                        className: "SearchGeometrySummary"
                    }
                },
                results: {
                    readOnly: true,
                    serializedName: "results",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "SearchGeometryResult"
                            }
                        }
                    }
                }
            }
        }
    };
    var SearchAlongRouteSummary = {
        serializedName: "SearchAlongRouteSummary",
        type: {
            name: "Composite",
            className: "SearchAlongRouteSummary",
            modelProperties: {
                query: {
                    readOnly: true,
                    serializedName: "query",
                    type: {
                        name: "String"
                    }
                },
                queryType: {
                    readOnly: true,
                    serializedName: "queryType",
                    type: {
                        name: "String"
                    }
                },
                queryTime: {
                    readOnly: true,
                    serializedName: "queryTime",
                    type: {
                        name: "Number"
                    }
                },
                numResults: {
                    readOnly: true,
                    serializedName: "numResults",
                    type: {
                        name: "Number"
                    }
                },
                offset: {
                    readOnly: true,
                    serializedName: "offset",
                    type: {
                        name: "Number"
                    }
                },
                totalResults: {
                    readOnly: true,
                    serializedName: "totalResults",
                    type: {
                        name: "Number"
                    }
                },
                fuzzyLevel: {
                    readOnly: true,
                    serializedName: "fuzzyLevel",
                    type: {
                        name: "Number"
                    }
                }
            }
        }
    };
    var SearchAlongRouteResult = {
        serializedName: "SearchAlongRouteResult",
        type: {
            name: "Composite",
            className: "SearchAlongRouteResult",
            modelProperties: {
                type: {
                    readOnly: true,
                    serializedName: "type",
                    type: {
                        name: "String"
                    }
                },
                id: {
                    readOnly: true,
                    serializedName: "id",
                    type: {
                        name: "String"
                    }
                },
                score: {
                    serializedName: "score",
                    type: {
                        name: "Number"
                    }
                },
                info: {
                    readOnly: true,
                    serializedName: "info",
                    type: {
                        name: "String"
                    }
                },
                entityType: {
                    serializedName: "entityType",
                    type: {
                        name: "Enum",
                        allowedValues: [
                            "Country",
                            "CountrySubdivision",
                            "CountrySecondarySubdivision",
                            "CountryTertiarySubdivision",
                            "Municipality",
                            "MunicipalitySubdivision",
                            "Neighbourhood",
                            "PostalCodeArea"
                        ]
                    }
                },
                poi: {
                    serializedName: "poi",
                    type: {
                        name: "Composite",
                        className: "SearchResultPoi"
                    }
                },
                address: {
                    serializedName: "address",
                    type: {
                        name: "Composite",
                        className: "SearchResultAddress"
                    }
                },
                position: {
                    serializedName: "position",
                    type: {
                        name: "Composite",
                        className: "CoordinateAbbreviated"
                    }
                },
                viewport: {
                    serializedName: "viewport",
                    type: {
                        name: "Composite",
                        className: "SearchResultViewport"
                    }
                },
                entryPoints: {
                    serializedName: "entryPoints",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "SearchResultEntryPoint"
                            }
                        }
                    }
                },
                dist: {
                    serializedName: "dist",
                    type: {
                        name: "Number"
                    }
                },
                detourTime: {
                    readOnly: true,
                    serializedName: "detourTime",
                    type: {
                        name: "Number"
                    }
                }
            }
        }
    };
    var SearchAlongRouteResponse = {
        serializedName: "SearchAlongRouteResponse",
        type: {
            name: "Composite",
            className: "SearchAlongRouteResponse",
            modelProperties: {
                summary: {
                    serializedName: "summary",
                    type: {
                        name: "Composite",
                        className: "SearchAlongRouteSummary"
                    }
                },
                results: {
                    readOnly: true,
                    serializedName: "results",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "SearchAlongRouteResult"
                            }
                        }
                    }
                }
            }
        }
    };
    var SearchInsideGeometryRequestBody = {
        serializedName: "SearchInsideGeometryRequestBody",
        type: {
            name: "Composite",
            className: "SearchInsideGeometryRequestBody",
            modelProperties: {
                geometry: {
                    serializedName: "geometry",
                    type: {
                        name: "Object"
                    }
                }
            }
        }
    };
    var SearchAlongRouteRequestBody = {
        serializedName: "SearchAlongRouteRequestBody",
        type: {
            name: "Composite",
            className: "SearchAlongRouteRequestBody",
            modelProperties: {
                route: {
                    serializedName: "route",
                    type: {
                        name: "Composite",
                        className: "LineString"
                    }
                }
            }
        }
    };
    var MultiPoint = {
        serializedName: "MultiPoint",
        type: {
            name: "Composite",
            polymorphicDiscriminator: GeoJSONGeometry.type.polymorphicDiscriminator,
            uberParent: "GeoJSONGeometry",
            className: "MultiPoint",
            modelProperties: __assign(__assign({}, GeoJSONGeometry.type.modelProperties), { coordinates: {
                    required: true,
                    serializedName: "coordinates",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Sequence",
                                element: {
                                    type: {
                                        name: "Number"
                                    }
                                }
                            }
                        }
                    }
                } })
        }
    };
    var Point = {
        serializedName: "Point",
        type: {
            name: "Composite",
            polymorphicDiscriminator: GeoJSONGeometry.type.polymorphicDiscriminator,
            uberParent: "GeoJSONGeometry",
            className: "Point",
            modelProperties: __assign(__assign({}, GeoJSONGeometry.type.modelProperties), { coordinates: {
                    required: true,
                    serializedName: "coordinates",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Number"
                            }
                        }
                    }
                } })
        }
    };
    var MultiPolygon = {
        serializedName: "MultiPolygon",
        type: {
            name: "Composite",
            polymorphicDiscriminator: GeoJSONGeometry.type.polymorphicDiscriminator,
            uberParent: "GeoJSONGeometry",
            className: "MultiPolygon",
            modelProperties: __assign(__assign({}, GeoJSONGeometry.type.modelProperties), { coordinates: {
                    required: true,
                    serializedName: "coordinates",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Sequence",
                                element: {
                                    type: {
                                        name: "Sequence",
                                        element: {
                                            type: {
                                                name: "Sequence",
                                                element: {
                                                    type: {
                                                        name: "Number"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                } })
        }
    };
    var GeoJSONGeometryCollection = {
        serializedName: "GeoJSONGeometryCollection",
        type: {
            name: "Composite",
            className: "GeoJSONGeometryCollection",
            modelProperties: {
                type: {
                    serializedName: "type",
                    type: {
                        name: "String"
                    }
                },
                geometries: {
                    required: true,
                    serializedName: "geometries",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "GeoJSONGeometry"
                            }
                        }
                    }
                }
            }
        }
    };
    var Coordinate = {
        serializedName: "Coordinate",
        type: {
            name: "Composite",
            className: "Coordinate",
            modelProperties: {
                latitude: {
                    readOnly: true,
                    serializedName: "latitude",
                    type: {
                        name: "Number"
                    }
                },
                longitude: {
                    readOnly: true,
                    serializedName: "longitude",
                    type: {
                        name: "Number"
                    }
                }
            }
        }
    };
    var RouteDirectionsRequestBodySupportingPoints = {
        serializedName: "RouteDirectionsRequestBody_supportingPoints",
        type: {
            name: "Composite",
            className: "RouteDirectionsRequestBodySupportingPoints",
            modelProperties: __assign({}, GeoJSONGeometryCollection.type.modelProperties)
        }
    };
    var RouteDirectionsRequestBody = {
        serializedName: "RouteDirectionsRequestBody",
        type: {
            name: "Composite",
            className: "RouteDirectionsRequestBody",
            modelProperties: {
                supportingPoints: {
                    serializedName: "supportingPoints",
                    type: {
                        name: "Composite",
                        className: "RouteDirectionsRequestBodySupportingPoints"
                    }
                },
                avoidVignette: {
                    serializedName: "avoidVignette",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "String"
                            }
                        }
                    }
                },
                allowVignette: {
                    serializedName: "allowVignette",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "String"
                            }
                        }
                    }
                },
                avoidAreas: {
                    serializedName: "avoidAreas",
                    type: {
                        name: "Composite",
                        className: "MultiPolygon"
                    }
                }
            }
        }
    };
    var RouteDirectionsSummary = {
        serializedName: "RouteDirectionsSummary",
        type: {
            name: "Composite",
            className: "RouteDirectionsSummary",
            modelProperties: {
                lengthInMeters: {
                    readOnly: true,
                    serializedName: "lengthInMeters",
                    type: {
                        name: "Number"
                    }
                },
                travelTimeInSeconds: {
                    readOnly: true,
                    serializedName: "travelTimeInSeconds",
                    type: {
                        name: "Number"
                    }
                },
                trafficDelayInSeconds: {
                    readOnly: true,
                    serializedName: "trafficDelayInSeconds",
                    type: {
                        name: "Number"
                    }
                },
                departureTime: {
                    readOnly: true,
                    serializedName: "departureTime",
                    type: {
                        name: "String"
                    }
                },
                arrivalTime: {
                    readOnly: true,
                    serializedName: "arrivalTime",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var RouteResultLegSummary = {
        serializedName: "RouteResultLegSummary",
        type: {
            name: "Composite",
            className: "RouteResultLegSummary",
            modelProperties: {
                lengthInMeters: {
                    readOnly: true,
                    serializedName: "lengthInMeters",
                    type: {
                        name: "Number"
                    }
                },
                travelTimeInSeconds: {
                    readOnly: true,
                    serializedName: "travelTimeInSeconds",
                    type: {
                        name: "Number"
                    }
                },
                trafficDelayInSeconds: {
                    readOnly: true,
                    serializedName: "trafficDelayInSeconds",
                    type: {
                        name: "Number"
                    }
                },
                departureTime: {
                    readOnly: true,
                    serializedName: "departureTime",
                    type: {
                        name: "String"
                    }
                },
                arrivalTime: {
                    readOnly: true,
                    serializedName: "arrivalTime",
                    type: {
                        name: "String"
                    }
                },
                noTrafficTravelTimeInSeconds: {
                    readOnly: true,
                    serializedName: "noTrafficTravelTimeInSeconds",
                    type: {
                        name: "Number"
                    }
                },
                historicTrafficTravelTimeInSeconds: {
                    readOnly: true,
                    serializedName: "historicTrafficTravelTimeInSeconds",
                    type: {
                        name: "Number"
                    }
                },
                liveTrafficIncidentsTravelTimeInSeconds: {
                    readOnly: true,
                    serializedName: "liveTrafficIncidentsTravelTimeInSeconds",
                    type: {
                        name: "Number"
                    }
                },
                fuelConsumptionInLiters: {
                    readOnly: true,
                    serializedName: "fuelConsumptionInLiters",
                    type: {
                        name: "Number"
                    }
                },
                batteryConsumptionInkWh: {
                    readOnly: true,
                    serializedName: "batteryConsumptionInkWh",
                    type: {
                        name: "Number"
                    }
                }
            }
        }
    };
    var RouteResultLeg = {
        serializedName: "RouteResultLeg",
        type: {
            name: "Composite",
            className: "RouteResultLeg",
            modelProperties: {
                summary: {
                    serializedName: "summary",
                    type: {
                        name: "Composite",
                        className: "RouteResultLegSummary"
                    }
                },
                points: {
                    readOnly: true,
                    serializedName: "points",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "Coordinate"
                            }
                        }
                    }
                }
            }
        }
    };
    var RouteResultSectionTecCause = {
        serializedName: "RouteResultSectionTecCause",
        type: {
            name: "Composite",
            className: "RouteResultSectionTecCause",
            modelProperties: {
                mainCauseCode: {
                    readOnly: true,
                    serializedName: "mainCauseCode",
                    type: {
                        name: "Number"
                    }
                },
                subCauseCode: {
                    readOnly: true,
                    serializedName: "subCauseCode",
                    type: {
                        name: "Number"
                    }
                }
            }
        }
    };
    var RouteResultSectionTec = {
        serializedName: "RouteResultSectionTec",
        type: {
            name: "Composite",
            className: "RouteResultSectionTec",
            modelProperties: {
                effectCode: {
                    readOnly: true,
                    serializedName: "effectCode",
                    type: {
                        name: "Number"
                    }
                },
                causes: {
                    serializedName: "causes",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "RouteResultSectionTecCause"
                            }
                        }
                    }
                }
            }
        }
    };
    var RouteResultSection = {
        serializedName: "RouteResultSection",
        type: {
            name: "Composite",
            className: "RouteResultSection",
            modelProperties: {
                startPointIndex: {
                    readOnly: true,
                    serializedName: "startPointIndex",
                    type: {
                        name: "Number"
                    }
                },
                endPointIndex: {
                    readOnly: true,
                    serializedName: "endPointIndex",
                    type: {
                        name: "Number"
                    }
                },
                sectionType: {
                    readOnly: true,
                    serializedName: "sectionType",
                    type: {
                        name: "String"
                    }
                },
                travelMode: {
                    readOnly: true,
                    serializedName: "travelMode",
                    type: {
                        name: "String"
                    }
                },
                simpleCategory: {
                    readOnly: true,
                    serializedName: "simpleCategory",
                    type: {
                        name: "String"
                    }
                },
                effectiveSpeedInKmh: {
                    readOnly: true,
                    serializedName: "effectiveSpeedInKmh",
                    type: {
                        name: "Number"
                    }
                },
                delayInSeconds: {
                    readOnly: true,
                    serializedName: "delayInSeconds",
                    type: {
                        name: "Number"
                    }
                },
                magnitudeOfDelay: {
                    readOnly: true,
                    serializedName: "magnitudeOfDelay",
                    type: {
                        name: "Enum",
                        allowedValues: [
                            "0",
                            "1",
                            "2",
                            "3",
                            "4"
                        ]
                    }
                },
                tec: {
                    serializedName: "tec",
                    type: {
                        name: "Composite",
                        className: "RouteResultSectionTec"
                    }
                }
            }
        }
    };
    var RouteResultInstruction = {
        serializedName: "RouteResultInstruction",
        type: {
            name: "Composite",
            className: "RouteResultInstruction",
            modelProperties: {
                routeOffsetInMeters: {
                    readOnly: true,
                    serializedName: "routeOffsetInMeters",
                    type: {
                        name: "Number"
                    }
                },
                travelTimeInSeconds: {
                    readOnly: true,
                    serializedName: "travelTimeInSeconds",
                    type: {
                        name: "Number"
                    }
                },
                point: {
                    serializedName: "point",
                    type: {
                        name: "Composite",
                        className: "Coordinate"
                    }
                },
                instructionType: {
                    serializedName: "instructionType",
                    type: {
                        name: "Enum",
                        allowedValues: [
                            "TURN",
                            "ROAD_CHANGE",
                            "LOCATION_DEPARTURE",
                            "LOCATION_ARRIVAL",
                            "DIRECTION_INFO",
                            "LOCATION_WAYPOINT"
                        ]
                    }
                },
                street: {
                    readOnly: true,
                    serializedName: "street",
                    type: {
                        name: "String"
                    }
                },
                countryCode: {
                    readOnly: true,
                    serializedName: "countryCode",
                    type: {
                        name: "String"
                    }
                },
                possibleCombineWithNext: {
                    readOnly: true,
                    serializedName: "possibleCombineWithNext",
                    type: {
                        name: "Boolean"
                    }
                },
                drivingSide: {
                    readOnly: true,
                    serializedName: "drivingSide",
                    type: {
                        name: "Enum",
                        allowedValues: [
                            "LEFT",
                            "RIGHT"
                        ]
                    }
                },
                maneuver: {
                    readOnly: true,
                    serializedName: "maneuver",
                    type: {
                        name: "Enum",
                        allowedValues: [
                            "ARRIVE",
                            "ARRIVE_LEFT",
                            "ARRIVE_RIGHT",
                            "DEPART",
                            "STRAIGHT",
                            "KEEP_RIGHT",
                            "BEAR_RIGHT",
                            "TURN_RIGHT",
                            "SHARP_RIGHT",
                            "KEEP_LEFT",
                            "BEAR_LEFT",
                            "TURN_LEFT",
                            "SHARP_LEFT",
                            "MAKE_UTURN",
                            "ENTER_MOTORWAY",
                            "ENTER_FREEWAY",
                            "ENTER_HIGHWAY",
                            "TAKE_EXIT",
                            "MOTORWAY_EXIT_LEFT",
                            "MOTORWAY_EXIT_RIGHT",
                            "TAKE_FERRY",
                            "ROUNDABOUT_CROSS",
                            "ROUNDABOUT_RIGHT",
                            "ROUNDABOUT_LEFT",
                            "ROUNDABOUT_BACK",
                            "TRY_MAKE_UTURN",
                            "FOLLOW",
                            "SWITCH_PARALLEL_ROAD",
                            "SWITCH_MAIN_ROAD",
                            "ENTRANCE_RAMP",
                            "WAYPOINT_LEFT",
                            "WAYPOINT_RIGHT",
                            "WAYPOINT_REACHED"
                        ]
                    }
                },
                message: {
                    readOnly: true,
                    serializedName: "message",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var RouteResultInstructionGroup = {
        serializedName: "RouteResultInstructionGroup",
        type: {
            name: "Composite",
            className: "RouteResultInstructionGroup",
            modelProperties: {
                firstInstructionIndex: {
                    readOnly: true,
                    serializedName: "firstInstructionIndex",
                    type: {
                        name: "Number"
                    }
                },
                lastInstructionIndex: {
                    readOnly: true,
                    serializedName: "lastInstructionIndex",
                    type: {
                        name: "Number"
                    }
                },
                groupLengthInMeters: {
                    readOnly: true,
                    serializedName: "groupLengthInMeters",
                    type: {
                        name: "Number"
                    }
                },
                groupMessage: {
                    readOnly: true,
                    serializedName: "groupMessage",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var RouteResultGuidance = {
        serializedName: "RouteResultGuidance",
        type: {
            name: "Composite",
            className: "RouteResultGuidance",
            modelProperties: {
                instructions: {
                    readOnly: true,
                    serializedName: "instructions",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "RouteResultInstruction"
                            }
                        }
                    }
                },
                instructionGroups: {
                    readOnly: true,
                    serializedName: "instructionGroups",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "RouteResultInstructionGroup"
                            }
                        }
                    }
                }
            }
        }
    };
    var RouteDirectionsResult = {
        serializedName: "RouteDirectionsResult",
        type: {
            name: "Composite",
            className: "RouteDirectionsResult",
            modelProperties: {
                summary: {
                    serializedName: "summary",
                    type: {
                        name: "Composite",
                        className: "RouteDirectionsSummary"
                    }
                },
                legs: {
                    readOnly: true,
                    serializedName: "legs",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "RouteResultLeg"
                            }
                        }
                    }
                },
                sections: {
                    readOnly: true,
                    serializedName: "sections",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "RouteResultSection"
                            }
                        }
                    }
                },
                guidance: {
                    serializedName: "guidance",
                    type: {
                        name: "Composite",
                        className: "RouteResultGuidance"
                    }
                }
            }
        }
    };
    var RouteOptimizedWaypoint = {
        serializedName: "RouteOptimizedWaypoint",
        type: {
            name: "Composite",
            className: "RouteOptimizedWaypoint",
            modelProperties: {
                providedIndex: {
                    readOnly: true,
                    serializedName: "providedIndex",
                    type: {
                        name: "Number"
                    }
                },
                optimizedIndex: {
                    readOnly: true,
                    serializedName: "optimizedIndex",
                    type: {
                        name: "Number"
                    }
                }
            }
        }
    };
    var RouteResponseReportEffectiveSetting = {
        serializedName: "RouteResponseReportEffectiveSetting",
        type: {
            name: "Composite",
            className: "RouteResponseReportEffectiveSetting",
            modelProperties: {
                key: {
                    readOnly: true,
                    serializedName: "key",
                    type: {
                        name: "String"
                    }
                },
                value: {
                    readOnly: true,
                    serializedName: "value",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var RouteResponseReport = {
        serializedName: "RouteResponseReport",
        type: {
            name: "Composite",
            className: "RouteResponseReport",
            modelProperties: {
                effectiveSettings: {
                    readOnly: true,
                    serializedName: "effectiveSettings",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "RouteResponseReportEffectiveSetting"
                            }
                        }
                    }
                }
            }
        }
    };
    var RouteDirectionsResponse = {
        serializedName: "RouteDirectionsResponse",
        type: {
            name: "Composite",
            className: "RouteDirectionsResponse",
            modelProperties: {
                formatVersion: {
                    readOnly: true,
                    serializedName: "formatVersion",
                    type: {
                        name: "String"
                    }
                },
                copyright: {
                    readOnly: true,
                    serializedName: "copyright",
                    type: {
                        name: "String"
                    }
                },
                privacy: {
                    readOnly: true,
                    serializedName: "privacy",
                    type: {
                        name: "String"
                    }
                },
                routes: {
                    readOnly: true,
                    serializedName: "routes",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "RouteDirectionsResult"
                            }
                        }
                    }
                },
                optimizedWaypoints: {
                    readOnly: true,
                    serializedName: "optimizedWaypoints",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "RouteOptimizedWaypoint"
                            }
                        }
                    }
                },
                report: {
                    serializedName: "report",
                    type: {
                        name: "Composite",
                        className: "RouteResponseReport"
                    }
                }
            }
        }
    };
    var RouteRange = {
        serializedName: "RouteRange",
        type: {
            name: "Composite",
            className: "RouteRange",
            modelProperties: {
                center: {
                    serializedName: "center",
                    type: {
                        name: "Composite",
                        className: "Coordinate"
                    }
                },
                boundary: {
                    readOnly: true,
                    serializedName: "boundary",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "Coordinate"
                            }
                        }
                    }
                }
            }
        }
    };
    var RouteRangeResponse = {
        serializedName: "RouteRangeResponse",
        type: {
            name: "Composite",
            className: "RouteRangeResponse",
            modelProperties: {
                formatVersion: {
                    readOnly: true,
                    serializedName: "formatVersion",
                    type: {
                        name: "String"
                    }
                },
                copyright: {
                    readOnly: true,
                    serializedName: "copyright",
                    type: {
                        name: "String"
                    }
                },
                privacy: {
                    readOnly: true,
                    serializedName: "privacy",
                    type: {
                        name: "String"
                    }
                },
                reachableRange: {
                    serializedName: "reachableRange",
                    type: {
                        name: "Composite",
                        className: "RouteRange"
                    }
                },
                report: {
                    serializedName: "report",
                    type: {
                        name: "Composite",
                        className: "RouteResponseReport"
                    }
                }
            }
        }
    };
    var RouteMatrixResultResponse = {
        serializedName: "RouteMatrixResultResponse",
        type: {
            name: "Composite",
            className: "RouteMatrixResultResponse",
            modelProperties: {
                routeSummary: {
                    serializedName: "routeSummary",
                    type: {
                        name: "Composite",
                        className: "RouteResultLegSummary"
                    }
                }
            }
        }
    };
    var RouteMatrixResult = {
        serializedName: "RouteMatrixResult",
        type: {
            name: "Composite",
            className: "RouteMatrixResult",
            modelProperties: {
                statusCode: {
                    readOnly: true,
                    serializedName: "statusCode",
                    type: {
                        name: "Number"
                    }
                },
                response: {
                    serializedName: "response",
                    type: {
                        name: "Composite",
                        className: "RouteMatrixResultResponse"
                    }
                }
            }
        }
    };
    var RouteMatrixSummary = {
        serializedName: "RouteMatrixSummary",
        type: {
            name: "Composite",
            className: "RouteMatrixSummary",
            modelProperties: {
                successfulRoutes: {
                    readOnly: true,
                    serializedName: "successfulRoutes",
                    type: {
                        name: "Number"
                    }
                },
                totalRoutes: {
                    readOnly: true,
                    serializedName: "totalRoutes",
                    type: {
                        name: "Number"
                    }
                }
            }
        }
    };
    var RouteMatrixResponse = {
        serializedName: "RouteMatrixResponse",
        type: {
            name: "Composite",
            className: "RouteMatrixResponse",
            modelProperties: {
                formatVersion: {
                    readOnly: true,
                    serializedName: "formatVersion",
                    type: {
                        name: "String"
                    }
                },
                matrix: {
                    readOnly: true,
                    serializedName: "matrix",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Sequence",
                                element: {
                                    type: {
                                        name: "Composite",
                                        className: "RouteMatrixResult"
                                    }
                                }
                            }
                        }
                    }
                },
                summary: {
                    serializedName: "summary",
                    type: {
                        name: "Composite",
                        className: "RouteMatrixSummary"
                    }
                }
            }
        }
    };
    var RouteMatrixRequestBody = {
        serializedName: "RouteMatrixRequestBody",
        type: {
            name: "Composite",
            className: "RouteMatrixRequestBody",
            modelProperties: {
                origins: {
                    serializedName: "origins",
                    type: {
                        name: "Composite",
                        className: "MultiPoint"
                    }
                },
                destinations: {
                    serializedName: "destinations",
                    type: {
                        name: "Composite",
                        className: "MultiPoint"
                    }
                }
            }
        }
    };
    var Country = {
        serializedName: "Country",
        type: {
            name: "Composite",
            className: "Country",
            modelProperties: {
                name: {
                    readOnly: true,
                    serializedName: "Name",
                    type: {
                        name: "String"
                    }
                },
                code: {
                    readOnly: true,
                    serializedName: "Code",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var TimeTransition = {
        serializedName: "TimeTransition",
        type: {
            name: "Composite",
            className: "TimeTransition",
            modelProperties: {
                tag: {
                    readOnly: true,
                    serializedName: "Tag",
                    type: {
                        name: "String"
                    }
                },
                standardOffset: {
                    readOnly: true,
                    serializedName: "StandardOffset",
                    type: {
                        name: "String"
                    }
                },
                daylightSavings: {
                    readOnly: true,
                    serializedName: "DaylightSavings",
                    type: {
                        name: "String"
                    }
                },
                utcStart: {
                    readOnly: true,
                    serializedName: "UtcStart",
                    type: {
                        name: "DateTime"
                    }
                },
                utcEnd: {
                    readOnly: true,
                    serializedName: "UtcEnd",
                    type: {
                        name: "DateTime"
                    }
                }
            }
        }
    };
    var Names = {
        serializedName: "Names",
        type: {
            name: "Composite",
            className: "Names",
            modelProperties: {
                iSO6391LanguageCode: {
                    readOnly: true,
                    serializedName: "ISO6391LanguageCode",
                    type: {
                        name: "String"
                    }
                },
                generic: {
                    readOnly: true,
                    serializedName: "Generic",
                    type: {
                        name: "String"
                    }
                },
                standard: {
                    readOnly: true,
                    serializedName: "Standard",
                    type: {
                        name: "String"
                    }
                },
                daylight: {
                    readOnly: true,
                    serializedName: "Daylight",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var ReferenceTimeById = {
        serializedName: "ReferenceTimeById",
        type: {
            name: "Composite",
            className: "ReferenceTimeById",
            modelProperties: {
                tag: {
                    readOnly: true,
                    serializedName: "Tag",
                    type: {
                        name: "String"
                    }
                },
                standardOffset: {
                    readOnly: true,
                    serializedName: "StandardOffset",
                    type: {
                        name: "String"
                    }
                },
                daylightSavings: {
                    readOnly: true,
                    serializedName: "DaylightSavings",
                    type: {
                        name: "String"
                    }
                },
                wallTime: {
                    readOnly: true,
                    serializedName: "WallTime",
                    type: {
                        name: "String"
                    }
                },
                posixTzValidYear: {
                    readOnly: true,
                    serializedName: "PosixTzValidYear",
                    type: {
                        name: "Number"
                    }
                },
                posixTz: {
                    readOnly: true,
                    serializedName: "PosixTz",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var RepresentativePoint = {
        serializedName: "RepresentativePoint",
        type: {
            name: "Composite",
            className: "RepresentativePoint",
            modelProperties: {
                latitude: {
                    readOnly: true,
                    serializedName: "Latitude",
                    type: {
                        name: "Number"
                    }
                },
                longitude: {
                    readOnly: true,
                    serializedName: "Longitude",
                    type: {
                        name: "Number"
                    }
                }
            }
        }
    };
    var TimezoneById = {
        serializedName: "TimezoneById",
        type: {
            name: "Composite",
            className: "TimezoneById",
            modelProperties: {
                id: {
                    readOnly: true,
                    serializedName: "Id",
                    type: {
                        name: "String"
                    }
                },
                aliases: {
                    readOnly: true,
                    serializedName: "Aliases",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "String"
                            }
                        }
                    }
                },
                countries: {
                    readOnly: true,
                    serializedName: "Countries",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "Country"
                            }
                        }
                    }
                },
                names: {
                    serializedName: "Names",
                    type: {
                        name: "Composite",
                        className: "Names"
                    }
                },
                referenceTime: {
                    serializedName: "ReferenceTime",
                    type: {
                        name: "Composite",
                        className: "ReferenceTimeById"
                    }
                },
                representativePoint: {
                    serializedName: "RepresentativePoint",
                    type: {
                        name: "Composite",
                        className: "RepresentativePoint"
                    }
                },
                timeTransitions: {
                    readOnly: true,
                    serializedName: "TimeTransitions",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "TimeTransition"
                            }
                        }
                    }
                }
            }
        }
    };
    var TimezoneByIdResult = {
        serializedName: "TimezoneByIdResult",
        type: {
            name: "Composite",
            className: "TimezoneByIdResult",
            modelProperties: {
                version: {
                    readOnly: true,
                    serializedName: "Version",
                    type: {
                        name: "String"
                    }
                },
                referenceUtcTimestamp: {
                    readOnly: true,
                    serializedName: "ReferenceUtcTimestamp",
                    type: {
                        name: "DateTime"
                    }
                },
                timeZones: {
                    serializedName: "TimeZones",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "TimezoneById"
                            }
                        }
                    }
                },
                count: {
                    readOnly: true,
                    serializedName: "Count",
                    type: {
                        name: "Number"
                    }
                }
            }
        }
    };
    var ReferenceTimeByCoordinates = {
        serializedName: "ReferenceTimeByCoordinates",
        type: {
            name: "Composite",
            className: "ReferenceTimeByCoordinates",
            modelProperties: {
                tag: {
                    readOnly: true,
                    serializedName: "Tag",
                    type: {
                        name: "String"
                    }
                },
                standardOffset: {
                    readOnly: true,
                    serializedName: "StandardOffset",
                    type: {
                        name: "String"
                    }
                },
                daylightSavings: {
                    readOnly: true,
                    serializedName: "DaylightSavings",
                    type: {
                        name: "String"
                    }
                },
                wallTime: {
                    readOnly: true,
                    serializedName: "WallTime",
                    type: {
                        name: "String"
                    }
                },
                posixTzValidYear: {
                    readOnly: true,
                    serializedName: "PosixTzValidYear",
                    type: {
                        name: "Number"
                    }
                },
                posixTz: {
                    readOnly: true,
                    serializedName: "PosixTz",
                    type: {
                        name: "String"
                    }
                },
                sunrise: {
                    readOnly: true,
                    serializedName: "Sunrise",
                    type: {
                        name: "String"
                    }
                },
                sunset: {
                    readOnly: true,
                    serializedName: "Sunset",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var TimeZoneByCoordinates = {
        serializedName: "TimeZoneByCoordinates",
        type: {
            name: "Composite",
            className: "TimeZoneByCoordinates",
            modelProperties: {
                id: {
                    readOnly: true,
                    serializedName: "Id",
                    type: {
                        name: "String"
                    }
                },
                aliases: {
                    readOnly: true,
                    serializedName: "Aliases",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "String"
                            }
                        }
                    }
                },
                countries: {
                    readOnly: true,
                    serializedName: "Countries",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "Country"
                            }
                        }
                    }
                },
                names: {
                    serializedName: "Names",
                    type: {
                        name: "Composite",
                        className: "Names"
                    }
                },
                referenceTime: {
                    serializedName: "ReferenceTime",
                    type: {
                        name: "Composite",
                        className: "ReferenceTimeByCoordinates"
                    }
                },
                representativePoint: {
                    serializedName: "RepresentativePoint",
                    type: {
                        name: "Composite",
                        className: "RepresentativePoint"
                    }
                },
                timeTransitions: {
                    readOnly: true,
                    serializedName: "TimeTransitions",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "TimeTransition"
                            }
                        }
                    }
                }
            }
        }
    };
    var TimezoneByCoordinatesResult = {
        serializedName: "TimezoneByCoordinatesResult",
        type: {
            name: "Composite",
            className: "TimezoneByCoordinatesResult",
            modelProperties: {
                version: {
                    readOnly: true,
                    serializedName: "Version",
                    type: {
                        name: "String"
                    }
                },
                referenceUtcTimestamp: {
                    readOnly: true,
                    serializedName: "ReferenceUtcTimestamp",
                    type: {
                        name: "DateTime"
                    }
                },
                timeZones: {
                    serializedName: "TimeZones",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "TimeZoneByCoordinates"
                            }
                        }
                    }
                },
                count: {
                    readOnly: true,
                    serializedName: "Count",
                    type: {
                        name: "Number"
                    }
                }
            }
        }
    };
    var TimezoneEnumWindow = {
        serializedName: "TimezoneEnumWindow",
        type: {
            name: "Composite",
            className: "TimezoneEnumWindow",
            modelProperties: {
                windowsId: {
                    readOnly: true,
                    serializedName: "WindowsId",
                    type: {
                        name: "String"
                    }
                },
                territory: {
                    readOnly: true,
                    serializedName: "Territory",
                    type: {
                        name: "String"
                    }
                },
                ianaIds: {
                    serializedName: "IanaIds",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "String"
                            }
                        }
                    }
                }
            }
        }
    };
    var IanaId = {
        serializedName: "IanaId",
        type: {
            name: "Composite",
            className: "IanaId",
            modelProperties: {
                id: {
                    readOnly: true,
                    serializedName: "id",
                    type: {
                        name: "String"
                    }
                },
                isAlias: {
                    readOnly: true,
                    serializedName: "isAlias",
                    type: {
                        name: "Boolean"
                    }
                },
                aliasOf: {
                    readOnly: true,
                    serializedName: "aliasOf",
                    type: {
                        name: "String"
                    }
                },
                hasZone1970Location: {
                    readOnly: true,
                    serializedName: "hasZone1970Location",
                    type: {
                        name: "Boolean"
                    }
                }
            }
        }
    };
    var TimezoneIanaVersionResult = {
        serializedName: "TimezoneIanaVersionResult",
        type: {
            name: "Composite",
            className: "TimezoneIanaVersionResult",
            modelProperties: {
                version: {
                    readOnly: true,
                    serializedName: "version",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var RegionCountry = {
        serializedName: "Region_country",
        type: {
            name: "Composite",
            className: "RegionCountry",
            modelProperties: {
                iSO3: {
                    readOnly: true,
                    serializedName: "ISO3",
                    type: {
                        name: "String"
                    }
                },
                label: {
                    readOnly: true,
                    serializedName: "label",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var Region = {
        serializedName: "Region",
        type: {
            name: "Composite",
            className: "Region",
            modelProperties: {
                copyrights: {
                    readOnly: true,
                    serializedName: "copyrights",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "String"
                            }
                        }
                    }
                },
                country: {
                    readOnly: true,
                    serializedName: "country",
                    type: {
                        name: "Composite",
                        className: "RegionCountry"
                    }
                }
            }
        }
    };
    var CopyrightBoundingResult = {
        serializedName: "CopyrightBoundingResult",
        type: {
            name: "Composite",
            className: "CopyrightBoundingResult",
            modelProperties: {
                formatVersion: {
                    readOnly: true,
                    serializedName: "formatVersion",
                    type: {
                        name: "String"
                    }
                },
                generalCopyrights: {
                    readOnly: true,
                    serializedName: "generalCopyrights",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "String"
                            }
                        }
                    }
                },
                regions: {
                    readOnly: true,
                    serializedName: "regions",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "Region"
                            }
                        }
                    }
                }
            }
        }
    };
    var CopyrightCaptionResult = {
        serializedName: "CopyrightCaptionResult",
        type: {
            name: "Composite",
            className: "CopyrightCaptionResult",
            modelProperties: {
                formatVersion: {
                    readOnly: true,
                    serializedName: "formatVersion",
                    type: {
                        name: "String"
                    }
                },
                copyrightsCaption: {
                    readOnly: true,
                    serializedName: "copyrightsCaption",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var CopyrightWorldResult = {
        serializedName: "CopyrightWorldResult",
        type: {
            name: "Composite",
            className: "CopyrightWorldResult",
            modelProperties: {
                formatVersion: {
                    readOnly: true,
                    serializedName: "formatVersion",
                    type: {
                        name: "String"
                    }
                },
                generalCopyrights: {
                    readOnly: true,
                    serializedName: "generalCopyrights",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "String"
                            }
                        }
                    }
                },
                regions: {
                    readOnly: true,
                    serializedName: "regions",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "Region"
                            }
                        }
                    }
                }
            }
        }
    };
    var CopyrightTileResult = {
        serializedName: "CopyrightTileResult",
        type: {
            name: "Composite",
            className: "CopyrightTileResult",
            modelProperties: {
                formatVersion: {
                    readOnly: true,
                    serializedName: "formatVersion",
                    type: {
                        name: "String"
                    }
                },
                generalCopyrights: {
                    readOnly: true,
                    serializedName: "generalCopyrights",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "String"
                            }
                        }
                    }
                },
                regions: {
                    readOnly: true,
                    serializedName: "regions",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "Region"
                            }
                        }
                    }
                }
            }
        }
    };
    var Polygon = {
        serializedName: "Polygon",
        type: {
            name: "Composite",
            polymorphicDiscriminator: GeoJSONGeometry.type.polymorphicDiscriminator,
            uberParent: "GeoJSONGeometry",
            className: "Polygon",
            modelProperties: __assign(__assign({}, GeoJSONGeometry.type.modelProperties), { coordinates: {
                    required: true,
                    serializedName: "coordinates",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Sequence",
                                element: {
                                    type: {
                                        name: "Sequence",
                                        element: {
                                            type: {
                                                name: "Number"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                } })
        }
    };
    var ResultViewport = {
        serializedName: "ResultViewport",
        type: {
            name: "Composite",
            className: "ResultViewport",
            modelProperties: {
                topLeftPoint: {
                    serializedName: "topLeftPoint",
                    type: {
                        name: "Composite",
                        className: "Coordinate"
                    }
                },
                btmRightPoint: {
                    serializedName: "btmRightPoint",
                    type: {
                        name: "Composite",
                        className: "Coordinate"
                    }
                }
            }
        }
    };
    var MetroAreaResult = {
        serializedName: "MetroAreaResult",
        type: {
            name: "Composite",
            className: "MetroAreaResult",
            modelProperties: {
                metroId: {
                    serializedName: "metroId",
                    type: {
                        name: "Number"
                    }
                },
                metroName: {
                    serializedName: "metroName",
                    type: {
                        name: "String"
                    }
                },
                geometry: {
                    serializedName: "geometry",
                    type: {
                        name: "Composite",
                        className: "Polygon"
                    }
                },
                viewport: {
                    serializedName: "viewport",
                    type: {
                        name: "Composite",
                        className: "ResultViewport"
                    }
                }
            }
        }
    };
    var MetroAreaResponse = {
        serializedName: "MetroAreaResponse",
        type: {
            name: "Composite",
            className: "MetroAreaResponse",
            modelProperties: {
                results: {
                    serializedName: "results",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "MetroAreaResult"
                            }
                        }
                    }
                }
            }
        }
    };
    var TransitTypeResult = {
        serializedName: "TransitTypeResult",
        type: {
            name: "Composite",
            className: "TransitTypeResult",
            modelProperties: {
                transitType: {
                    serializedName: "transitType",
                    type: {
                        name: "Enum",
                        allowedValues: [
                            "Bus",
                            "CableCar",
                            "Ferry",
                            "Funicular",
                            "Gondola",
                            "Rail",
                            "Tram",
                            "Subway"
                        ]
                    }
                },
                captionOverride: {
                    serializedName: "captionOverride",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var Agency = {
        serializedName: "Agency",
        type: {
            name: "Composite",
            className: "Agency",
            modelProperties: {
                agencyId: {
                    serializedName: "agencyId",
                    type: {
                        name: "String"
                    }
                },
                agencyKey: {
                    serializedName: "agencyKey",
                    type: {
                        name: "String"
                    }
                },
                agencyName: {
                    serializedName: "agencyName",
                    type: {
                        name: "String"
                    }
                },
                transitType: {
                    serializedName: "transitType",
                    type: {
                        name: "Composite",
                        className: "TransitTypeResult"
                    }
                }
            }
        }
    };
    var AlertDescription = {
        serializedName: "AlertDescription",
        type: {
            name: "Composite",
            className: "AlertDescription",
            modelProperties: {
                data: {
                    serializedName: "data",
                    type: {
                        name: "String"
                    }
                },
                format: {
                    serializedName: "format",
                    type: {
                        name: "String"
                    }
                },
                sourceUrl: {
                    serializedName: "sourceUrl",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var AlertDetail = {
        serializedName: "AlertDetail",
        type: {
            name: "Composite",
            className: "AlertDetail",
            modelProperties: {
                agencyId: {
                    serializedName: "agencyId",
                    type: {
                        name: "String"
                    }
                },
                agencyName: {
                    serializedName: "agencyName",
                    type: {
                        name: "String"
                    }
                },
                title: {
                    serializedName: "title",
                    type: {
                        name: "String"
                    }
                },
                description: {
                    serializedName: "description",
                    type: {
                        name: "Composite",
                        className: "AlertDescription"
                    }
                },
                activeFrom: {
                    serializedName: "activeFrom",
                    type: {
                        name: "DateTime"
                    }
                },
                activeTo: {
                    serializedName: "activeTo",
                    type: {
                        name: "DateTime"
                    }
                },
                effect: {
                    serializedName: "effect",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var Alert = {
        serializedName: "Alert",
        type: {
            name: "Composite",
            className: "Alert",
            modelProperties: {
                alertSummary: {
                    serializedName: "alertSummary",
                    type: {
                        name: "String"
                    }
                },
                publicationDate: {
                    serializedName: "publicationDate",
                    type: {
                        name: "DateTime"
                    }
                },
                category: {
                    serializedName: "category",
                    type: {
                        name: "String"
                    }
                },
                alertLevel: {
                    serializedName: "alertLevel",
                    type: {
                        name: "String"
                    }
                },
                details: {
                    serializedName: "details",
                    type: {
                        name: "Composite",
                        className: "AlertDetail"
                    }
                }
            }
        }
    };
    var MetroAreaInfoResponse = {
        serializedName: "MetroAreaInfoResponse",
        type: {
            name: "Composite",
            className: "MetroAreaInfoResponse",
            modelProperties: {
                metroName: {
                    serializedName: "metroName",
                    type: {
                        name: "String"
                    }
                },
                transitTypes: {
                    serializedName: "transitTypes",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "TransitTypeResult"
                            }
                        }
                    }
                },
                agencies: {
                    serializedName: "agencies",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "Agency"
                            }
                        }
                    }
                },
                alerts: {
                    serializedName: "alerts",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "Alert"
                            }
                        }
                    }
                }
            }
        }
    };
    var TransitObjectResult = {
        serializedName: "TransitObjectResult",
        type: {
            name: "Composite",
            className: "TransitObjectResult",
            modelProperties: {
                id: {
                    serializedName: "id",
                    type: {
                        name: "String"
                    }
                },
                type: {
                    serializedName: "type",
                    type: {
                        name: "String"
                    }
                },
                objectDetails: {
                    serializedName: "objectDetails",
                    type: {
                        name: "Object"
                    }
                },
                position: {
                    serializedName: "position",
                    type: {
                        name: "Composite",
                        className: "Coordinate"
                    }
                },
                viewport: {
                    serializedName: "viewport",
                    type: {
                        name: "Composite",
                        className: "ResultViewport"
                    }
                }
            }
        }
    };
    var NearbyTransitResponse = {
        serializedName: "NearbyTransitResponse",
        type: {
            name: "Composite",
            className: "NearbyTransitResponse",
            modelProperties: {
                results: {
                    serializedName: "results",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "TransitObjectResult"
                            }
                        }
                    }
                }
            }
        }
    };
    var Stop = {
        serializedName: "Stop",
        type: {
            name: "Composite",
            className: "Stop",
            modelProperties: {
                stopId: {
                    serializedName: "stopId",
                    type: {
                        name: "String"
                    }
                },
                stopKey: {
                    serializedName: "stopKey",
                    type: {
                        name: "String"
                    }
                },
                stopName: {
                    serializedName: "stopName",
                    type: {
                        name: "String"
                    }
                },
                stopCode: {
                    serializedName: "stopCode",
                    type: {
                        name: "String"
                    }
                },
                position: {
                    serializedName: "position",
                    type: {
                        name: "Composite",
                        className: "Coordinate"
                    }
                },
                mainTransitType: {
                    serializedName: "mainTransitType",
                    type: {
                        name: "String"
                    }
                },
                mainAgencyId: {
                    serializedName: "mainAgencyId",
                    type: {
                        name: "String"
                    }
                },
                mainAgencyName: {
                    serializedName: "mainAgencyName",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var Line = {
        serializedName: "Line",
        type: {
            name: "Composite",
            className: "Line",
            modelProperties: {
                lineId: {
                    serializedName: "lineId",
                    type: {
                        name: "String"
                    }
                },
                lineGroupId: {
                    serializedName: "lineGroupId",
                    type: {
                        name: "String"
                    }
                },
                direction: {
                    serializedName: "direction",
                    type: {
                        name: "String"
                    }
                },
                agencyId: {
                    serializedName: "agencyId",
                    type: {
                        name: "String"
                    }
                },
                agencyName: {
                    serializedName: "agencyName",
                    type: {
                        name: "String"
                    }
                },
                lineNumber: {
                    serializedName: "lineNumber",
                    type: {
                        name: "String"
                    }
                },
                origin: {
                    serializedName: "origin",
                    type: {
                        name: "String"
                    }
                },
                lineDestination: {
                    serializedName: "lineDestination",
                    type: {
                        name: "String"
                    }
                },
                mostFrequentPatternId: {
                    serializedName: "mostFrequentPatternId",
                    type: {
                        name: "String"
                    }
                },
                transitType: {
                    serializedName: "transitType",
                    type: {
                        name: "Enum",
                        allowedValues: [
                            "Bus",
                            "CableCar",
                            "Ferry",
                            "Funicular",
                            "Gondola",
                            "Rail",
                            "Tram",
                            "Subway"
                        ]
                    }
                }
            }
        }
    };
    var LineGroup = {
        serializedName: "LineGroup",
        type: {
            name: "Composite",
            className: "LineGroup",
            modelProperties: {
                lineGroupId: {
                    serializedName: "lineGroupId",
                    type: {
                        name: "String"
                    }
                },
                agencyId: {
                    serializedName: "agencyId",
                    type: {
                        name: "String"
                    }
                },
                agencyName: {
                    serializedName: "agencyName",
                    type: {
                        name: "String"
                    }
                },
                lineNumber: {
                    serializedName: "lineNumber",
                    type: {
                        name: "String"
                    }
                },
                caption1: {
                    serializedName: "caption1",
                    type: {
                        name: "String"
                    }
                },
                caption2: {
                    serializedName: "caption2",
                    type: {
                        name: "String"
                    }
                },
                color: {
                    serializedName: "color",
                    type: {
                        name: "String"
                    }
                },
                transitType: {
                    serializedName: "transitType",
                    type: {
                        name: "Enum",
                        allowedValues: [
                            "Bus",
                            "CableCar",
                            "Ferry",
                            "Funicular",
                            "Gondola",
                            "Rail",
                            "Tram",
                            "Subway"
                        ]
                    }
                }
            }
        }
    };
    var TransitStopInfoResponse = {
        serializedName: "TransitStopInfoResponse",
        type: {
            name: "Composite",
            className: "TransitStopInfoResponse",
            modelProperties: {
                stop: {
                    serializedName: "stop",
                    type: {
                        name: "Composite",
                        className: "Stop"
                    }
                },
                lines: {
                    serializedName: "lines",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "Line"
                            }
                        }
                    }
                },
                lineGroups: {
                    serializedName: "lineGroups",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "LineGroup"
                            }
                        }
                    }
                },
                alerts: {
                    serializedName: "alerts",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "Alert"
                            }
                        }
                    }
                }
            }
        }
    };
    var RouteItineraryLeg = {
        serializedName: "RouteItineraryLeg",
        type: {
            name: "Composite",
            className: "RouteItineraryLeg",
            modelProperties: {
                legType: {
                    serializedName: "legType",
                    type: {
                        name: "Enum",
                        allowedValues: [
                            "Walk",
                            "Bicycle",
                            "Tram",
                            "Subway",
                            "Rail",
                            "Bus",
                            "Ferry",
                            "Cable",
                            "Gondola",
                            "Funicular",
                            "PathWayWalk",
                            "Wait",
                            "WaitOnVehicle"
                        ]
                    }
                },
                legStartTime: {
                    serializedName: "legStartTime",
                    type: {
                        name: "String"
                    }
                },
                legEndTime: {
                    serializedName: "legEndTime",
                    type: {
                        name: "String"
                    }
                },
                caption: {
                    serializedName: "caption",
                    type: {
                        name: "String"
                    }
                },
                lengthInMeters: {
                    serializedName: "lengthInMeters",
                    type: {
                        name: "Number"
                    }
                }
            }
        }
    };
    var ItineraryResult = {
        serializedName: "ItineraryResult",
        type: {
            name: "Composite",
            className: "ItineraryResult",
            modelProperties: {
                itineraryId: {
                    serializedName: "itineraryId",
                    type: {
                        name: "String"
                    }
                },
                departureTime: {
                    serializedName: "departureTime",
                    type: {
                        name: "DateTime"
                    }
                },
                arrivalTime: {
                    serializedName: "arrivalTime",
                    type: {
                        name: "DateTime"
                    }
                },
                travelTimeInSeconds: {
                    serializedName: "travelTimeInSeconds",
                    type: {
                        name: "Number"
                    }
                },
                numberOfLegs: {
                    serializedName: "numberOfLegs",
                    type: {
                        name: "Number"
                    }
                },
                legs: {
                    serializedName: "legs",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "RouteItineraryLeg"
                            }
                        }
                    }
                }
            }
        }
    };
    var TransitRouteResponse = {
        serializedName: "TransitRouteResponse",
        type: {
            name: "Composite",
            className: "TransitRouteResponse",
            modelProperties: {
                results: {
                    serializedName: "results",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "ItineraryResult"
                            }
                        }
                    }
                }
            }
        }
    };
    var Direction = {
        serializedName: "Direction",
        type: {
            name: "Composite",
            className: "Direction",
            modelProperties: {
                relativeDirection: {
                    serializedName: "relativeDirection",
                    type: {
                        name: "Enum",
                        allowedValues: [
                            "depart",
                            "hardLeft",
                            "left",
                            "slightlyLeft",
                            "continue",
                            "slightlyRight",
                            "right",
                            "hardRight",
                            "circleClockwise",
                            "circleCounterclockwise",
                            "elevator",
                            "uturnLeft",
                            "uturnRight"
                        ]
                    }
                },
                absoluteDirection: {
                    serializedName: "absoluteDirection",
                    type: {
                        name: "Enum",
                        allowedValues: [
                            "north",
                            "northeast",
                            "east",
                            "southeast",
                            "south",
                            "southwest",
                            "west",
                            "northwest"
                        ]
                    }
                }
            }
        }
    };
    var Step = {
        serializedName: "Step",
        type: {
            name: "Composite",
            className: "Step",
            modelProperties: {
                direction: {
                    serializedName: "direction",
                    type: {
                        name: "Composite",
                        className: "Direction"
                    }
                },
                streetName: {
                    serializedName: "streetName",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var LegPoint = {
        serializedName: "LegPoint",
        type: {
            name: "Composite",
            className: "LegPoint",
            modelProperties: {
                position: {
                    serializedName: "position",
                    type: {
                        name: "Composite",
                        className: "Coordinate"
                    }
                }
            }
        }
    };
    var LineArrival = {
        serializedName: "LineArrival",
        type: {
            name: "Composite",
            className: "LineArrival",
            modelProperties: {
                lineId: {
                    serializedName: "lineId",
                    type: {
                        name: "String"
                    }
                },
                stopId: {
                    serializedName: "stopId",
                    type: {
                        name: "String"
                    }
                },
                scheduleTime: {
                    serializedName: "scheduleTime",
                    type: {
                        name: "DateTime"
                    }
                },
                scheduleType: {
                    serializedName: "scheduleType",
                    type: {
                        name: "Enum",
                        allowedValues: [
                            "scheduledTime",
                            "realTime"
                        ]
                    }
                }
            }
        }
    };
    var Leg = {
        serializedName: "Leg",
        type: {
            name: "Composite",
            className: "Leg",
            modelProperties: {
                legType: {
                    serializedName: "legType",
                    type: {
                        name: "Enum",
                        allowedValues: [
                            "Walk",
                            "Bicycle",
                            "Tram",
                            "Subway",
                            "Rail",
                            "Bus",
                            "Ferry",
                            "Cable",
                            "Gondola",
                            "Funicular",
                            "PathWayWalk",
                            "Wait",
                            "WaitOnVehicle"
                        ]
                    }
                },
                legStartTime: {
                    serializedName: "legStartTime",
                    type: {
                        name: "String"
                    }
                },
                legEndTime: {
                    serializedName: "legEndTime",
                    type: {
                        name: "String"
                    }
                },
                steps: {
                    serializedName: "steps",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "Step"
                            }
                        }
                    }
                },
                origin: {
                    serializedName: "origin",
                    type: {
                        name: "Composite",
                        className: "LegPoint"
                    }
                },
                destination: {
                    serializedName: "destination",
                    type: {
                        name: "Composite",
                        className: "LegPoint"
                    }
                },
                geometry: {
                    serializedName: "geometry",
                    type: {
                        name: "Composite",
                        className: "LineString"
                    }
                },
                lineGroup: {
                    serializedName: "lineGroup",
                    type: {
                        name: "Composite",
                        className: "LineGroup"
                    }
                },
                line: {
                    serializedName: "line",
                    type: {
                        name: "Composite",
                        className: "Line"
                    }
                },
                stops: {
                    serializedName: "stops",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "Stop"
                            }
                        }
                    }
                },
                departures: {
                    serializedName: "departures",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "LineArrival"
                            }
                        }
                    }
                },
                waitOnVehicle: {
                    serializedName: "waitOnVehicle",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var TransitItineraryResponse = {
        serializedName: "TransitItineraryResponse",
        type: {
            name: "Composite",
            className: "TransitItineraryResponse",
            modelProperties: {
                departureTime: {
                    serializedName: "departureTime",
                    type: {
                        name: "String"
                    }
                },
                arrivalTime: {
                    serializedName: "arrivalTime",
                    type: {
                        name: "String"
                    }
                },
                legs: {
                    serializedName: "legs",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "Leg"
                            }
                        }
                    }
                }
            }
        }
    };
    var Pricing = {
        serializedName: "Pricing",
        type: {
            name: "Composite",
            className: "Pricing",
            modelProperties: {
                currency: {
                    serializedName: "currency",
                    type: {
                        name: "String"
                    }
                },
                usagePrice: {
                    serializedName: "usagePrice",
                    type: {
                        name: "String"
                    }
                },
                reservationPrice: {
                    serializedName: "reservationPrice",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var OperatorInfo = {
        serializedName: "OperatorInfo",
        type: {
            name: "Composite",
            className: "OperatorInfo",
            modelProperties: {
                id: {
                    serializedName: "id",
                    type: {
                        name: "String"
                    }
                },
                name: {
                    serializedName: "name",
                    type: {
                        name: "String"
                    }
                },
                description: {
                    serializedName: "description",
                    type: {
                        name: "String"
                    }
                },
                siteUrl: {
                    serializedName: "siteUrl",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var CarShareResponse = {
        serializedName: "CarShareResponse",
        type: {
            name: "Composite",
            className: "CarShareResponse",
            modelProperties: {
                name: {
                    serializedName: "name",
                    type: {
                        name: "String"
                    }
                },
                model: {
                    serializedName: "model",
                    type: {
                        name: "String"
                    }
                },
                seatCount: {
                    serializedName: "seatCount",
                    type: {
                        name: "Number"
                    }
                },
                fuelLevel: {
                    serializedName: "fuelLevel",
                    type: {
                        name: "Number"
                    }
                },
                batteryLevel: {
                    serializedName: "batteryLevel",
                    type: {
                        name: "Number"
                    }
                },
                pricing: {
                    serializedName: "pricing",
                    type: {
                        name: "Composite",
                        className: "Pricing"
                    }
                },
                position: {
                    serializedName: "position",
                    type: {
                        name: "Composite",
                        className: "Coordinate"
                    }
                },
                operatorInfo: {
                    serializedName: "operatorInfo",
                    type: {
                        name: "Composite",
                        className: "OperatorInfo"
                    }
                }
            }
        }
    };
    var TransitDockInfoResponse = {
        serializedName: "TransitDockInfoResponse",
        type: {
            name: "Composite",
            className: "TransitDockInfoResponse",
            modelProperties: {
                availableVehicles: {
                    serializedName: "availableVehicles",
                    type: {
                        name: "Number"
                    }
                },
                vacantLocations: {
                    serializedName: "vacantLocations",
                    type: {
                        name: "Number"
                    }
                },
                position: {
                    serializedName: "position",
                    type: {
                        name: "Composite",
                        className: "Coordinate"
                    }
                },
                lastUpdated: {
                    serializedName: "lastUpdated",
                    type: {
                        name: "DateTime"
                    }
                },
                operatorInfo: {
                    serializedName: "operatorInfo",
                    type: {
                        name: "Composite",
                        className: "OperatorInfo"
                    }
                }
            }
        }
    };
    var Pattern = {
        serializedName: "Pattern",
        type: {
            name: "Composite",
            className: "Pattern",
            modelProperties: {
                patternId: {
                    serializedName: "patternId",
                    type: {
                        name: "String"
                    }
                },
                lineId: {
                    serializedName: "lineId",
                    type: {
                        name: "String"
                    }
                },
                stopIds: {
                    serializedName: "stopIds",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "String"
                            }
                        }
                    }
                },
                geometry: {
                    serializedName: "geometry",
                    type: {
                        name: "Composite",
                        className: "LineString"
                    }
                }
            }
        }
    };
    var TransitLineInfoResponse = {
        serializedName: "TransitLineInfoResponse",
        type: {
            name: "Composite",
            className: "TransitLineInfoResponse",
            modelProperties: {
                lineGroup: {
                    serializedName: "lineGroup",
                    type: {
                        name: "Composite",
                        className: "LineGroup"
                    }
                },
                lines: {
                    serializedName: "lines",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "Line"
                            }
                        }
                    }
                },
                stops: {
                    serializedName: "stops",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "Stop"
                            }
                        }
                    }
                },
                patterns: {
                    serializedName: "patterns",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "Pattern"
                            }
                        }
                    }
                },
                schedule: {
                    serializedName: "schedule",
                    type: {
                        name: "Composite",
                        className: "LineArrival"
                    }
                }
            }
        }
    };
    var RealTimeArrivalResult = {
        serializedName: "RealTimeArrivalResult",
        type: {
            name: "Composite",
            className: "RealTimeArrivalResult",
            modelProperties: {
                arrivalMinutes: {
                    serializedName: "arrivalMinutes",
                    type: {
                        name: "Number"
                    }
                },
                scheduleType: {
                    serializedName: "scheduleType",
                    type: {
                        name: "Enum",
                        allowedValues: [
                            "scheduledTime",
                            "realTime"
                        ]
                    }
                },
                patternId: {
                    serializedName: "patternId",
                    type: {
                        name: "String"
                    }
                },
                line: {
                    serializedName: "line",
                    type: {
                        name: "Composite",
                        className: "Line"
                    }
                },
                stop: {
                    serializedName: "stop",
                    type: {
                        name: "Composite",
                        className: "Stop"
                    }
                }
            }
        }
    };
    var RealTimeArrivalsResponse = {
        serializedName: "RealTimeArrivalsResponse",
        type: {
            name: "Composite",
            className: "RealTimeArrivalsResponse",
            modelProperties: {
                results: {
                    serializedName: "results",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "RealTimeArrivalResult"
                            }
                        }
                    }
                }
            }
        }
    };
    var SpatialCoordinate = {
        serializedName: "SpatialCoordinate",
        type: {
            name: "Composite",
            className: "SpatialCoordinate",
            modelProperties: {
                lat: {
                    readOnly: true,
                    serializedName: "lat",
                    type: {
                        name: "Number"
                    }
                },
                lon: {
                    readOnly: true,
                    serializedName: "lon",
                    type: {
                        name: "Number"
                    }
                }
            }
        }
    };
    var GeoJSONFeatureCollectionFeaturesItem = {
        serializedName: "GeoJSONFeatureCollection_featuresItem",
        type: {
            name: "Composite",
            className: "GeoJSONFeatureCollectionFeaturesItem",
            modelProperties: {
                type: {
                    serializedName: "type",
                    type: {
                        name: "String"
                    }
                },
                geometry: {
                    serializedName: "geometry",
                    type: {
                        name: "Composite",
                        className: "GeoJSONGeometry"
                    }
                },
                properties: {
                    serializedName: "properties",
                    type: {
                        name: "Object"
                    }
                }
            }
        }
    };
    var GeoJSONFeatureCollection = {
        serializedName: "GeoJSONFeatureCollection",
        type: {
            name: "Composite",
            className: "GeoJSONFeatureCollection",
            modelProperties: {
                type: {
                    required: true,
                    serializedName: "type",
                    type: {
                        name: "String"
                    }
                },
                features: {
                    required: true,
                    serializedName: "features",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "GeoJSONFeatureCollectionFeaturesItem"
                            }
                        }
                    }
                }
            }
        }
    };
    var MultiLineString = {
        serializedName: "MultiLineString",
        type: {
            name: "Composite",
            polymorphicDiscriminator: GeoJSONGeometry.type.polymorphicDiscriminator,
            uberParent: "GeoJSONGeometry",
            className: "MultiLineString",
            modelProperties: __assign(__assign({}, GeoJSONGeometry.type.modelProperties), { coordinates: {
                    required: true,
                    serializedName: "coordinates",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Sequence",
                                element: {
                                    type: {
                                        name: "Sequence",
                                        element: {
                                            type: {
                                                name: "Number"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                } })
        }
    };
    var GeofenceGeometry = {
        serializedName: "GeofenceGeometry",
        type: {
            name: "Composite",
            className: "GeofenceGeometry",
            modelProperties: {
                deviceId: {
                    readOnly: true,
                    serializedName: "deviceId",
                    type: {
                        name: "String"
                    }
                },
                udId: {
                    readOnly: true,
                    serializedName: "udId",
                    type: {
                        name: "String"
                    }
                },
                geometryId: {
                    readOnly: true,
                    serializedName: "geometryId",
                    type: {
                        name: "String"
                    }
                },
                distance: {
                    readOnly: true,
                    serializedName: "distance",
                    type: {
                        name: "Number"
                    }
                },
                nearestLat: {
                    readOnly: true,
                    serializedName: "nearestLat",
                    type: {
                        name: "Number"
                    }
                },
                nearestLon: {
                    readOnly: true,
                    serializedName: "nearestLon",
                    type: {
                        name: "Number"
                    }
                }
            }
        }
    };
    var GeofenceResponse = {
        serializedName: "GeofenceResponse",
        type: {
            name: "Composite",
            className: "GeofenceResponse",
            modelProperties: {
                geometries: {
                    readOnly: true,
                    serializedName: "geometries",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "GeofenceGeometry"
                            }
                        }
                    }
                },
                expiredGeofenceGeometryId: {
                    readOnly: true,
                    serializedName: "expiredGeofenceGeometryId",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "String"
                            }
                        }
                    }
                },
                invalidPeriodGeofenceGeometryId: {
                    readOnly: true,
                    serializedName: "invalidPeriodGeofenceGeometryId",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "String"
                            }
                        }
                    }
                },
                isEventPublished: {
                    readOnly: true,
                    serializedName: "isEventPublished",
                    type: {
                        name: "Boolean"
                    }
                }
            }
        }
    };
    var BufferRequestBody = {
        serializedName: "BufferRequestBody",
        type: {
            name: "Composite",
            className: "BufferRequestBody",
            modelProperties: {
                geometries: {
                    serializedName: "geometries",
                    type: {
                        name: "Composite",
                        className: "GeoJSONFeatureCollection"
                    }
                },
                distances: {
                    serializedName: "distances",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Number"
                            }
                        }
                    }
                }
            }
        }
    };
    var BufferResponseSummary = {
        serializedName: "BufferResponse_summary",
        type: {
            name: "Composite",
            className: "BufferResponseSummary",
            modelProperties: {
                udid: {
                    readOnly: true,
                    serializedName: "udid",
                    type: {
                        name: "String"
                    }
                },
                information: {
                    readOnly: true,
                    serializedName: "information",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var BufferResponse = {
        serializedName: "BufferResponse",
        type: {
            name: "Composite",
            className: "BufferResponse",
            modelProperties: {
                summary: {
                    readOnly: true,
                    serializedName: "summary",
                    type: {
                        name: "Composite",
                        className: "BufferResponseSummary"
                    }
                },
                result: {
                    serializedName: "result",
                    type: {
                        name: "Composite",
                        className: "GeoJSONFeatureCollection"
                    }
                }
            }
        }
    };
    var GetClosestPointSummary = {
        serializedName: "GetClosestPointSummary",
        type: {
            name: "Composite",
            className: "GetClosestPointSummary",
            modelProperties: {
                sourcePoint: {
                    serializedName: "sourcePoint",
                    type: {
                        name: "Composite",
                        className: "SpatialCoordinate"
                    }
                },
                udid: {
                    readOnly: true,
                    serializedName: "udid",
                    type: {
                        name: "String"
                    }
                },
                information: {
                    readOnly: true,
                    serializedName: "information",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var ClosestPointResultEntry = {
        serializedName: "ClosestPointResultEntry",
        type: {
            name: "Composite",
            className: "ClosestPointResultEntry",
            modelProperties: {
                distanceInMeters: {
                    readOnly: true,
                    serializedName: "distanceInMeters",
                    type: {
                        name: "Number"
                    }
                },
                position: {
                    serializedName: "position",
                    type: {
                        name: "Composite",
                        className: "SpatialCoordinate"
                    }
                },
                geometryId: {
                    readOnly: true,
                    serializedName: "geometryId",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var GetClosestPointResponse = {
        serializedName: "GetClosestPointResponse",
        type: {
            name: "Composite",
            className: "GetClosestPointResponse",
            modelProperties: {
                summary: {
                    serializedName: "summary",
                    type: {
                        name: "Composite",
                        className: "GetClosestPointSummary"
                    }
                },
                result: {
                    serializedName: "result",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "ClosestPointResultEntry"
                            }
                        }
                    }
                }
            }
        }
    };
    var PostClosestPointSummary = {
        serializedName: "PostClosestPointSummary",
        type: {
            name: "Composite",
            className: "PostClosestPointSummary",
            modelProperties: {
                sourcePoint: {
                    serializedName: "sourcePoint",
                    type: {
                        name: "Composite",
                        className: "SpatialCoordinate"
                    }
                },
                udid: {
                    readOnly: true,
                    serializedName: "udid",
                    type: {
                        name: "String"
                    }
                },
                information: {
                    readOnly: true,
                    serializedName: "information",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var PostClosestPointResponse = {
        serializedName: "PostClosestPointResponse",
        type: {
            name: "Composite",
            className: "PostClosestPointResponse",
            modelProperties: {
                summary: {
                    serializedName: "summary",
                    type: {
                        name: "Composite",
                        className: "PostClosestPointSummary"
                    }
                },
                result: {
                    serializedName: "result",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "ClosestPointResultEntry"
                            }
                        }
                    }
                }
            }
        }
    };
    var GetPointInPolygonSummary = {
        serializedName: "GetPointInPolygonSummary",
        type: {
            name: "Composite",
            className: "GetPointInPolygonSummary",
            modelProperties: {
                sourcePoint: {
                    serializedName: "sourcePoint",
                    type: {
                        name: "Composite",
                        className: "SpatialCoordinate"
                    }
                },
                udid: {
                    readOnly: true,
                    serializedName: "udid",
                    type: {
                        name: "String"
                    }
                },
                information: {
                    readOnly: true,
                    serializedName: "information",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var PointInPolygonResult = {
        serializedName: "PointInPolygonResult",
        type: {
            name: "Composite",
            className: "PointInPolygonResult",
            modelProperties: {
                pointInPolygons: {
                    readOnly: true,
                    serializedName: "pointInPolygons",
                    type: {
                        name: "Boolean"
                    }
                },
                intersectingGeometries: {
                    readOnly: true,
                    serializedName: "intersectingGeometries",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "String"
                            }
                        }
                    }
                }
            }
        }
    };
    var GetPointInPolygonResponse = {
        serializedName: "GetPointInPolygonResponse",
        type: {
            name: "Composite",
            className: "GetPointInPolygonResponse",
            modelProperties: {
                summary: {
                    serializedName: "summary",
                    type: {
                        name: "Composite",
                        className: "GetPointInPolygonSummary"
                    }
                },
                result: {
                    serializedName: "result",
                    type: {
                        name: "Composite",
                        className: "PointInPolygonResult"
                    }
                }
            }
        }
    };
    var PostPointInPolygonSummary = {
        serializedName: "PostPointInPolygonSummary",
        type: {
            name: "Composite",
            className: "PostPointInPolygonSummary",
            modelProperties: {
                sourcePoint: {
                    serializedName: "sourcePoint",
                    type: {
                        name: "Composite",
                        className: "SpatialCoordinate"
                    }
                },
                udid: {
                    readOnly: true,
                    serializedName: "udid",
                    type: {
                        name: "String"
                    }
                },
                information: {
                    readOnly: true,
                    serializedName: "information",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var PostPointInPolygonResponse = {
        serializedName: "PostPointInPolygonResponse",
        type: {
            name: "Composite",
            className: "PostPointInPolygonResponse",
            modelProperties: {
                summary: {
                    serializedName: "summary",
                    type: {
                        name: "Composite",
                        className: "PostPointInPolygonSummary"
                    }
                },
                result: {
                    serializedName: "result",
                    type: {
                        name: "Composite",
                        className: "PointInPolygonResult"
                    }
                }
            }
        }
    };
    var GreatCircleDistanceResponseSummary = {
        serializedName: "GreatCircleDistanceResponse_summary",
        type: {
            name: "Composite",
            className: "GreatCircleDistanceResponseSummary",
            modelProperties: {
                sourcePoint: {
                    serializedName: "sourcePoint",
                    type: {
                        name: "Composite",
                        className: "SpatialCoordinate"
                    }
                },
                targetPoint: {
                    serializedName: "targetPoint",
                    type: {
                        name: "Composite",
                        className: "SpatialCoordinate"
                    }
                }
            }
        }
    };
    var GreatCircleDistanceResponseResult = {
        serializedName: "GreatCircleDistanceResponse_result",
        type: {
            name: "Composite",
            className: "GreatCircleDistanceResponseResult",
            modelProperties: {
                distanceInMeters: {
                    readOnly: true,
                    serializedName: "distanceInMeters",
                    type: {
                        name: "Number"
                    }
                }
            }
        }
    };
    var GreatCircleDistanceResponse = {
        serializedName: "GreatCircleDistanceResponse",
        type: {
            name: "Composite",
            className: "GreatCircleDistanceResponse",
            modelProperties: {
                summary: {
                    readOnly: true,
                    serializedName: "summary",
                    type: {
                        name: "Composite",
                        className: "GreatCircleDistanceResponseSummary"
                    }
                },
                result: {
                    readOnly: true,
                    serializedName: "result",
                    type: {
                        name: "Composite",
                        className: "GreatCircleDistanceResponseResult"
                    }
                }
            }
        }
    };
    var SearchPostSearchFuzzyBatchPreviewHeaders = {
        serializedName: "search-postsearchfuzzybatchpreview-headers",
        type: {
            name: "Composite",
            className: "SearchPostSearchFuzzyBatchPreviewHeaders",
            modelProperties: {
                location: {
                    serializedName: "location",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var SearchPostSearchAddressBatchPreviewHeaders = {
        serializedName: "search-postsearchaddressbatchpreview-headers",
        type: {
            name: "Composite",
            className: "SearchPostSearchAddressBatchPreviewHeaders",
            modelProperties: {
                location: {
                    serializedName: "location",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var SearchPostSearchAddressReverseBatchPreviewHeaders = {
        serializedName: "search-postsearchaddressreversebatchpreview-headers",
        type: {
            name: "Composite",
            className: "SearchPostSearchAddressReverseBatchPreviewHeaders",
            modelProperties: {
                location: {
                    serializedName: "location",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var RoutePostRouteMatrixPreviewHeaders = {
        serializedName: "route-postroutematrixpreview-headers",
        type: {
            name: "Composite",
            className: "RoutePostRouteMatrixPreviewHeaders",
            modelProperties: {
                location: {
                    serializedName: "location",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var RoutePostRouteDirectionsBatchPreviewHeaders = {
        serializedName: "route-postroutedirectionsbatchpreview-headers",
        type: {
            name: "Composite",
            className: "RoutePostRouteDirectionsBatchPreviewHeaders",
            modelProperties: {
                location: {
                    serializedName: "location",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var SpatialGetGeofenceHeaders = {
        serializedName: "spatial-getgeofence-headers",
        type: {
            name: "Composite",
            className: "SpatialGetGeofenceHeaders",
            modelProperties: {
                xCorrelationId: {
                    serializedName: "x-correlation-id",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var SpatialPostGeofenceHeaders = {
        serializedName: "spatial-postgeofence-headers",
        type: {
            name: "Composite",
            className: "SpatialPostGeofenceHeaders",
            modelProperties: {
                xCorrelationId: {
                    serializedName: "x-correlation-id",
                    type: {
                        name: "String"
                    }
                }
            }
        }
    };
    var discriminators = {
        'GeoJSONGeometry': GeoJSONGeometry,
        'GeoJSONGeometry.LineString': LineString,
        'GeoJSONGeometry.MultiPoint': MultiPoint,
        'GeoJSONGeometry.Point': Point,
        'GeoJSONGeometry.MultiPolygon': MultiPolygon,
        'GeoJSONGeometry.Polygon': Polygon,
        'GeoJSONGeometry.MultiLineString': MultiLineString
    };

    /*
     * Code generated by Microsoft (R) AutoRest Code Generator.
     * Changes may cause incorrect behavior and will be lost if the code is regenerated.
     */

    var Mappers = /*#__PURE__*/Object.freeze({
        discriminators: discriminators,
        BatchRequestBody: BatchRequestBody,
        BatchRequestBodyBatchItemsItem: BatchRequestBodyBatchItemsItem,
        BatchResponse: BatchResponse,
        BatchResponseSummary: BatchResponseSummary,
        CloudError: CloudError,
        CoordinateAbbreviated: CoordinateAbbreviated,
        DataSources: DataSources,
        DataSourcesGeometry: DataSourcesGeometry,
        GeoJSONGeometry: GeoJSONGeometry,
        LineString: LineString,
        MultiLineString: MultiLineString,
        MultiPoint: MultiPoint,
        MultiPolygon: MultiPolygon,
        Point: Point,
        Polygon: Polygon,
        SearchAddressResponse: SearchAddressResponse,
        SearchAddressResult: SearchAddressResult,
        SearchAddressReverseCrossStreetResponse: SearchAddressReverseCrossStreetResponse,
        SearchAddressReverseCrossStreetResult: SearchAddressReverseCrossStreetResult,
        SearchAddressReverseCrossStreetSummary: SearchAddressReverseCrossStreetSummary,
        SearchAddressReverseResponse: SearchAddressReverseResponse,
        SearchAddressReverseResult: SearchAddressReverseResult,
        SearchAddressReverseSummary: SearchAddressReverseSummary,
        SearchAddressStructuredResponse: SearchAddressStructuredResponse,
        SearchAddressStructuredResult: SearchAddressStructuredResult,
        SearchAddressStructuredSummary: SearchAddressStructuredSummary,
        SearchAddressSummary: SearchAddressSummary,
        SearchAlongRouteRequestBody: SearchAlongRouteRequestBody,
        SearchAlongRouteResponse: SearchAlongRouteResponse,
        SearchAlongRouteResult: SearchAlongRouteResult,
        SearchAlongRouteSummary: SearchAlongRouteSummary,
        SearchFuzzyResponse: SearchFuzzyResponse,
        SearchFuzzyResult: SearchFuzzyResult,
        SearchFuzzySummary: SearchFuzzySummary,
        SearchGeometryResponse: SearchGeometryResponse,
        SearchGeometryResult: SearchGeometryResult,
        SearchGeometrySummary: SearchGeometrySummary,
        SearchInsideGeometryRequestBody: SearchInsideGeometryRequestBody,
        SearchNearbyResponse: SearchNearbyResponse,
        SearchNearbyResult: SearchNearbyResult,
        SearchNearbySummary: SearchNearbySummary,
        SearchPoiCategoryResponse: SearchPoiCategoryResponse,
        SearchPoiCategoryResult: SearchPoiCategoryResult,
        SearchPoiCategorySummary: SearchPoiCategorySummary,
        SearchPoiResponse: SearchPoiResponse,
        SearchPoiResult: SearchPoiResult,
        SearchPoiSummary: SearchPoiSummary,
        SearchPolygonResponse: SearchPolygonResponse,
        SearchPolygonResult: SearchPolygonResult,
        SearchPostSearchAddressBatchPreviewHeaders: SearchPostSearchAddressBatchPreviewHeaders,
        SearchPostSearchAddressReverseBatchPreviewHeaders: SearchPostSearchAddressReverseBatchPreviewHeaders,
        SearchPostSearchFuzzyBatchPreviewHeaders: SearchPostSearchFuzzyBatchPreviewHeaders,
        SearchResultAddress: SearchResultAddress,
        SearchResultAddressRanges: SearchResultAddressRanges,
        SearchResultEntryPoint: SearchResultEntryPoint,
        SearchResultPoi: SearchResultPoi,
        SearchResultPoiBrand: SearchResultPoiBrand,
        SearchResultPoiClassification: SearchResultPoiClassification,
        SearchResultPoiClassificationName: SearchResultPoiClassificationName,
        SearchResultViewport: SearchResultViewport,
        SearchSummaryGeoBias: SearchSummaryGeoBias
    });

    /*
     * Code generated by Microsoft (R) AutoRest Code Generator.
     * Changes may cause incorrect behavior and will be lost if the code is
     * regenerated.
     */
    var accelerationEfficiency = {
        parameterPath: [
            "options",
            "accelerationEfficiency"
        ],
        mapper: {
            serializedName: "accelerationEfficiency",
            type: {
                name: "Number"
            }
        }
    };
    var acceptLanguage0 = {
        parameterPath: "acceptLanguage",
        mapper: {
            serializedName: "accept-language",
            defaultValue: 'en-US',
            type: {
                name: "String"
            }
        }
    };
    var acceptLanguage1 = {
        parameterPath: [
            "options",
            "acceptLanguage"
        ],
        mapper: {
            serializedName: "Accept-Language",
            type: {
                name: "String"
            }
        }
    };
    var agency = {
        parameterPath: [
            "options",
            "agency"
        ],
        mapper: {
            serializedName: "agency",
            type: {
                name: "Sequence",
                element: {
                    type: {
                        name: "String"
                    }
                }
            }
        },
        collectionFormat: QueryCollectionFormat.Csv
    };
    var agencyType = {
        parameterPath: [
            "options",
            "agencyType"
        ],
        mapper: {
            serializedName: "agencyType",
            type: {
                name: "Enum",
                allowedValues: [
                    "agencyId",
                    "agencyKey",
                    "agencyName"
                ]
            }
        }
    };
    var allowFreeformNewline = {
        parameterPath: [
            "options",
            "allowFreeformNewline"
        ],
        mapper: {
            serializedName: "allowFreeformNewline",
            type: {
                name: "Boolean"
            }
        }
    };
    var alternativeType = {
        parameterPath: [
            "options",
            "alternativeType"
        ],
        mapper: {
            serializedName: "alternativeType",
            type: {
                name: "Enum",
                allowedValues: [
                    "anyRoute",
                    "betterRoute"
                ]
            }
        }
    };
    var apiVersion = {
        parameterPath: "apiVersion",
        mapper: {
            required: true,
            serializedName: "api-version",
            type: {
                name: "String"
            }
        }
    };
    var arriveAt = {
        parameterPath: [
            "options",
            "arriveAt"
        ],
        mapper: {
            serializedName: "arriveAt",
            type: {
                name: "DateTime"
            }
        }
    };
    var auxiliaryPowerInkW = {
        parameterPath: [
            "options",
            "auxiliaryPowerInkW"
        ],
        mapper: {
            serializedName: "auxiliaryPowerInkW",
            type: {
                name: "String"
            }
        }
    };
    var auxiliaryPowerInLitersPerHour = {
        parameterPath: [
            "options",
            "auxiliaryPowerInLitersPerHour"
        ],
        mapper: {
            serializedName: "auxiliaryPowerInLitersPerHour",
            type: {
                name: "Number"
            }
        }
    };
    var avoid = {
        parameterPath: [
            "options",
            "avoid"
        ],
        mapper: {
            serializedName: "avoid",
            type: {
                name: "Enum",
                allowedValues: [
                    "tollRoads",
                    "motorways",
                    "ferries",
                    "unpavedRoads",
                    "carpools",
                    "alreadyUsedRoads",
                    "borderCrossings"
                ]
            }
        }
    };
    var bbox = {
        parameterPath: [
            "options",
            "bbox"
        ],
        mapper: {
            serializedName: "bbox",
            type: {
                name: "String"
            }
        }
    };
    var bikeType = {
        parameterPath: [
            "options",
            "bikeType"
        ],
        mapper: {
            serializedName: "bikeType",
            type: {
                name: "Enum",
                allowedValues: [
                    "privateBike",
                    "dockedBike"
                ]
            }
        }
    };
    var brandSet = {
        parameterPath: [
            "options",
            "brandSet"
        ],
        mapper: {
            serializedName: "brandSet",
            type: {
                name: "Sequence",
                element: {
                    type: {
                        name: "String"
                    }
                }
            }
        },
        collectionFormat: QueryCollectionFormat.Csv
    };
    var btmRight = {
        parameterPath: [
            "options",
            "btmRight"
        ],
        mapper: {
            serializedName: "btmRight",
            type: {
                name: "String"
            }
        }
    };
    var center = {
        parameterPath: [
            "options",
            "center"
        ],
        mapper: {
            serializedName: "center",
            type: {
                name: "String"
            }
        }
    };
    var computeBestOrder = {
        parameterPath: [
            "options",
            "computeBestOrder"
        ],
        mapper: {
            serializedName: "computeBestOrder",
            type: {
                name: "Boolean"
            }
        }
    };
    var computeTravelTimeFor = {
        parameterPath: [
            "options",
            "computeTravelTimeFor"
        ],
        mapper: {
            serializedName: "computeTravelTimeFor",
            type: {
                name: "Enum",
                allowedValues: [
                    "none",
                    "all"
                ]
            }
        }
    };
    var connectorSet = {
        parameterPath: [
            "options",
            "connectorSet"
        ],
        mapper: {
            serializedName: "connectorSet",
            type: {
                name: "Sequence",
                element: {
                    type: {
                        name: "Enum",
                        allowedValues: [
                            "StandardHouseholdCountrySpecific",
                            "IEC62196Type1",
                            "IEC62196Type1CCS",
                            "IEC62196Type2CableAttached",
                            "IEC62196Type2Outlet",
                            "IEC62196Type2CCS",
                            "IEC62196Type3",
                            "Chademo",
                            "IEC60309AC1PhaseBlue",
                            "IEC60309DCWhite",
                            "Tesla"
                        ]
                    }
                }
            }
        },
        collectionFormat: QueryCollectionFormat.Csv
    };
    var constantSpeedConsumptionInkWhPerHundredkm = {
        parameterPath: [
            "options",
            "constantSpeedConsumptionInkWhPerHundredkm"
        ],
        mapper: {
            serializedName: "constantSpeedConsumptionInkWhPerHundredkm",
            type: {
                name: "String"
            }
        }
    };
    var constantSpeedConsumptionInLitersPerHundredkm = {
        parameterPath: [
            "options",
            "constantSpeedConsumptionInLitersPerHundredkm"
        ],
        mapper: {
            serializedName: "constantSpeedConsumptionInLitersPerHundredkm",
            type: {
                name: "Number"
            }
        }
    };
    var countryCode = {
        parameterPath: "countryCode",
        mapper: {
            required: true,
            serializedName: "countryCode",
            type: {
                name: "String"
            }
        }
    };
    var countrySecondarySubdivision = {
        parameterPath: [
            "options",
            "countrySecondarySubdivision"
        ],
        mapper: {
            serializedName: "countrySecondarySubdivision",
            type: {
                name: "String"
            }
        }
    };
    var countrySet = {
        parameterPath: [
            "options",
            "countrySet"
        ],
        mapper: {
            serializedName: "countrySet",
            type: {
                name: "Sequence",
                element: {
                    type: {
                        name: "String"
                    }
                }
            }
        },
        collectionFormat: QueryCollectionFormat.Csv
    };
    var countrySubdivision = {
        parameterPath: [
            "options",
            "countrySubdivision"
        ],
        mapper: {
            serializedName: "countrySubdivision",
            type: {
                name: "String"
            }
        }
    };
    var countryTertiarySubdivision = {
        parameterPath: [
            "options",
            "countryTertiarySubdivision"
        ],
        mapper: {
            serializedName: "countryTertiarySubdivision",
            type: {
                name: "String"
            }
        }
    };
    var crossStreet = {
        parameterPath: [
            "options",
            "crossStreet"
        ],
        mapper: {
            serializedName: "crossStreet",
            type: {
                name: "String"
            }
        }
    };
    var currentChargeInkWh = {
        parameterPath: [
            "options",
            "currentChargeInkWh"
        ],
        mapper: {
            serializedName: "currentChargeInkWh",
            type: {
                name: "String"
            }
        }
    };
    var currentFuelInLiters = {
        parameterPath: [
            "options",
            "currentFuelInLiters"
        ],
        mapper: {
            serializedName: "currentFuelInLiters",
            type: {
                name: "Number"
            }
        }
    };
    var decelerationEfficiency = {
        parameterPath: [
            "options",
            "decelerationEfficiency"
        ],
        mapper: {
            serializedName: "decelerationEfficiency",
            type: {
                name: "Number"
            }
        }
    };
    var departAt = {
        parameterPath: [
            "options",
            "departAt"
        ],
        mapper: {
            serializedName: "departAt",
            type: {
                name: "DateTime"
            }
        }
    };
    var destination = {
        parameterPath: "destination",
        mapper: {
            required: true,
            serializedName: "destination",
            type: {
                name: "String"
            }
        }
    };
    var destinationType = {
        parameterPath: [
            "options",
            "destinationType"
        ],
        mapper: {
            serializedName: "destinationType",
            type: {
                name: "Enum",
                allowedValues: [
                    "position",
                    "stopId",
                    "stopKey"
                ]
            }
        }
    };
    var detailType0 = {
        parameterPath: "detailType",
        mapper: {
            required: true,
            serializedName: "detailType",
            type: {
                name: "Sequence",
                element: {
                    type: {
                        name: "Enum",
                        allowedValues: [
                            "agencies",
                            "alerts",
                            "alertDetails",
                            "transitTypes"
                        ]
                    }
                }
            }
        },
        collectionFormat: QueryCollectionFormat.Csv
    };
    var detailType1 = {
        parameterPath: [
            "options",
            "detailType"
        ],
        mapper: {
            serializedName: "detailType",
            type: {
                name: "Sequence",
                element: {
                    type: {
                        name: "Enum",
                        allowedValues: [
                            "alerts",
                            "alertDetails",
                            "lines",
                            "stops",
                            "schedule",
                            "patterns"
                        ]
                    }
                }
            }
        },
        collectionFormat: QueryCollectionFormat.Csv
    };
    var detailType2 = {
        parameterPath: [
            "options",
            "detailType"
        ],
        mapper: {
            serializedName: "detailType",
            type: {
                name: "Sequence",
                element: {
                    type: {
                        name: "Enum",
                        allowedValues: [
                            "alerts",
                            "alertDetails",
                            "lines",
                            "lineGroups"
                        ]
                    }
                }
            }
        },
        collectionFormat: QueryCollectionFormat.Csv
    };
    var detailType3 = {
        parameterPath: [
            "options",
            "detailType"
        ],
        mapper: {
            serializedName: "detailType",
            type: {
                name: "Sequence",
                element: {
                    type: {
                        name: "Enum",
                        allowedValues: [
                            "geometry",
                            "schedule"
                        ]
                    }
                }
            }
        },
        collectionFormat: QueryCollectionFormat.Csv
    };
    var deviceId = {
        parameterPath: "deviceId",
        mapper: {
            required: true,
            serializedName: "deviceId",
            type: {
                name: "String"
            }
        }
    };
    var distances = {
        parameterPath: "distances",
        mapper: {
            required: true,
            serializedName: "distances",
            type: {
                name: "String"
            }
        }
    };
    var downhillEfficiency = {
        parameterPath: [
            "options",
            "downhillEfficiency"
        ],
        mapper: {
            serializedName: "downhillEfficiency",
            type: {
                name: "Number"
            }
        }
    };
    var energyBudgetInkWh = {
        parameterPath: [
            "options",
            "energyBudgetInkWh"
        ],
        mapper: {
            serializedName: "energyBudgetInkWh",
            type: {
                name: "Number"
            }
        }
    };
    var entityType = {
        parameterPath: [
            "options",
            "entityType"
        ],
        mapper: {
            serializedName: "entityType",
            type: {
                name: "Enum",
                allowedValues: [
                    "Country",
                    "CountrySubdivision",
                    "CountrySecondarySubdivision",
                    "CountryTertiarySubdivision",
                    "Municipality",
                    "MunicipalitySubdivision",
                    "Neighbourhood",
                    "PostalCodeArea"
                ]
            }
        }
    };
    var extendedPostalCodesFor = {
        parameterPath: [
            "options",
            "extendedPostalCodesFor"
        ],
        mapper: {
            serializedName: "extendedPostalCodesFor",
            type: {
                name: "String"
            }
        }
    };
    var format0 = {
        parameterPath: "format",
        mapper: {
            required: true,
            isConstant: true,
            serializedName: "format",
            defaultValue: 'json',
            type: {
                name: "String"
            }
        }
    };
    var format1 = {
        parameterPath: "format",
        mapper: {
            required: true,
            isConstant: true,
            serializedName: "format",
            defaultValue: 'png',
            type: {
                name: "String"
            }
        }
    };
    var format2 = {
        parameterPath: "format",
        mapper: {
            required: true,
            serializedName: "format",
            type: {
                name: "Enum",
                allowedValues: [
                    "png",
                    "pbf"
                ]
            }
        }
    };
    var fuelBudgetInLiters = {
        parameterPath: [
            "options",
            "fuelBudgetInLiters"
        ],
        mapper: {
            serializedName: "fuelBudgetInLiters",
            type: {
                name: "Number"
            }
        }
    };
    var fuelEnergyDensityInMJoulesPerLiter = {
        parameterPath: [
            "options",
            "fuelEnergyDensityInMJoulesPerLiter"
        ],
        mapper: {
            serializedName: "fuelEnergyDensityInMJoulesPerLiter",
            type: {
                name: "Number"
            }
        }
    };
    var geometries = {
        parameterPath: "geometries",
        mapper: {
            required: true,
            serializedName: "geometries",
            type: {
                name: "String"
            }
        }
    };
    var heading = {
        parameterPath: [
            "options",
            "heading"
        ],
        mapper: {
            serializedName: "heading",
            constraints: {
                InclusiveMaximum: 360,
                InclusiveMinimum: -360
            },
            type: {
                name: "Number"
            }
        }
    };
    var height = {
        parameterPath: [
            "options",
            "height"
        ],
        mapper: {
            serializedName: "height",
            constraints: {
                InclusiveMaximum: 8192,
                InclusiveMinimum: 1
            },
            type: {
                name: "Number"
            }
        }
    };
    var hilliness = {
        parameterPath: [
            "options",
            "hilliness"
        ],
        mapper: {
            serializedName: "hilliness",
            type: {
                name: "Enum",
                allowedValues: [
                    "low",
                    "normal",
                    "high"
                ]
            }
        }
    };
    var idxSet = {
        parameterPath: [
            "options",
            "idxSet"
        ],
        mapper: {
            serializedName: "idxSet",
            type: {
                name: "Sequence",
                element: {
                    type: {
                        name: "Enum",
                        allowedValues: [
                            "Addr",
                            "Geo",
                            "PAD",
                            "POI",
                            "Str",
                            "Xstr"
                        ]
                    }
                }
            }
        },
        collectionFormat: QueryCollectionFormat.Csv
    };
    var instructionsType = {
        parameterPath: [
            "options",
            "instructionsType"
        ],
        mapper: {
            serializedName: "instructionsType",
            type: {
                name: "Enum",
                allowedValues: [
                    "coded",
                    "text",
                    "tagged"
                ]
            }
        }
    };
    var isAsync = {
        parameterPath: [
            "options",
            "isAsync"
        ],
        mapper: {
            serializedName: "isAsync",
            type: {
                name: "Boolean"
            }
        }
    };
    var language = {
        parameterPath: [
            "options",
            "language"
        ],
        mapper: {
            serializedName: "language",
            type: {
                name: "String"
            }
        }
    };
    var lat0 = {
        parameterPath: [
            "options",
            "lat"
        ],
        mapper: {
            serializedName: "lat",
            type: {
                name: "Number"
            }
        }
    };
    var lat1 = {
        parameterPath: "lat",
        mapper: {
            required: true,
            serializedName: "lat",
            type: {
                name: "Number"
            }
        }
    };
    var layer0 = {
        parameterPath: [
            "options",
            "layer"
        ],
        mapper: {
            serializedName: "layer",
            type: {
                name: "Enum",
                allowedValues: [
                    "basic",
                    "hybrid",
                    "labels"
                ]
            }
        }
    };
    var layer1 = {
        parameterPath: "layer",
        mapper: {
            required: true,
            serializedName: "layer",
            type: {
                name: "Enum",
                allowedValues: [
                    "basic",
                    "hybrid",
                    "labels",
                    "terra"
                ]
            }
        }
    };
    var limit0 = {
        parameterPath: [
            "options",
            "limit"
        ],
        mapper: {
            serializedName: "limit",
            constraints: {
                InclusiveMaximum: 100,
                InclusiveMinimum: 1
            },
            type: {
                name: "Number"
            }
        }
    };
    var limit1 = {
        parameterPath: [
            "options",
            "limit"
        ],
        mapper: {
            serializedName: "limit",
            type: {
                name: "Number"
            }
        }
    };
    var limit2 = {
        parameterPath: [
            "options",
            "limit"
        ],
        mapper: {
            serializedName: "limit",
            constraints: {
                InclusiveMaximum: 20
            },
            type: {
                name: "Number"
            }
        }
    };
    var lon0 = {
        parameterPath: [
            "options",
            "lon"
        ],
        mapper: {
            serializedName: "lon",
            type: {
                name: "Number"
            }
        }
    };
    var lon1 = {
        parameterPath: "lon",
        mapper: {
            required: true,
            serializedName: "lon",
            type: {
                name: "Number"
            }
        }
    };
    var maxAlternatives = {
        parameterPath: [
            "options",
            "maxAlternatives"
        ],
        mapper: {
            serializedName: "maxAlternatives",
            constraints: {
                InclusiveMaximum: 5,
                InclusiveMinimum: 0
            },
            type: {
                name: "Number"
            }
        }
    };
    var maxChargeInkWh = {
        parameterPath: [
            "options",
            "maxChargeInkWh"
        ],
        mapper: {
            serializedName: "maxChargeInkWh",
            type: {
                name: "String"
            }
        }
    };
    var maxcoordinates = {
        parameterPath: "maxcoordinates",
        mapper: {
            required: true,
            serializedName: "maxcoordinates",
            type: {
                name: "String"
            }
        }
    };
    var maxDetourTime = {
        parameterPath: "maxDetourTime",
        mapper: {
            required: true,
            serializedName: "maxDetourTime",
            constraints: {
                InclusiveMaximum: 3600
            },
            type: {
                name: "Number"
            }
        }
    };
    var maxFuzzyLevel = {
        parameterPath: [
            "options",
            "maxFuzzyLevel"
        ],
        mapper: {
            serializedName: "maxFuzzyLevel",
            constraints: {
                InclusiveMaximum: 4,
                InclusiveMinimum: 1
            },
            type: {
                name: "Number"
            }
        }
    };
    var maxMinutesInFuture = {
        parameterPath: [
            "options",
            "maxMinutesInFuture"
        ],
        mapper: {
            serializedName: "maxMinutesInFuture",
            type: {
                name: "Number"
            }
        }
    };
    var metroId = {
        parameterPath: "metroId",
        mapper: {
            required: true,
            serializedName: "metroId",
            type: {
                name: "Number"
            }
        }
    };
    var mincoordinates = {
        parameterPath: "mincoordinates",
        mapper: {
            required: true,
            serializedName: "mincoordinates",
            type: {
                name: "String"
            }
        }
    };
    var minDeviationDistance = {
        parameterPath: [
            "options",
            "minDeviationDistance"
        ],
        mapper: {
            serializedName: "minDeviationDistance",
            type: {
                name: "Number"
            }
        }
    };
    var minDeviationTime = {
        parameterPath: [
            "options",
            "minDeviationTime"
        ],
        mapper: {
            serializedName: "minDeviationTime",
            type: {
                name: "Number"
            }
        }
    };
    var minFuzzyLevel = {
        parameterPath: [
            "options",
            "minFuzzyLevel"
        ],
        mapper: {
            serializedName: "minFuzzyLevel",
            constraints: {
                InclusiveMaximum: 4,
                InclusiveMinimum: 1
            },
            type: {
                name: "Number"
            }
        }
    };
    var mode = {
        parameterPath: [
            "options",
            "mode"
        ],
        mapper: {
            serializedName: "mode",
            type: {
                name: "Enum",
                allowedValues: [
                    "All",
                    "EnterAndExit"
                ]
            }
        }
    };
    var modeType = {
        parameterPath: [
            "options",
            "modeType"
        ],
        mapper: {
            serializedName: "modeType",
            type: {
                name: "Sequence",
                element: {
                    type: {
                        name: "Enum",
                        allowedValues: [
                            "walk",
                            "bike",
                            "publicTransit"
                        ]
                    }
                }
            }
        },
        collectionFormat: QueryCollectionFormat.Csv
    };
    var municipality = {
        parameterPath: [
            "options",
            "municipality"
        ],
        mapper: {
            serializedName: "municipality",
            type: {
                name: "String"
            }
        }
    };
    var municipalitySubdivision = {
        parameterPath: [
            "options",
            "municipalitySubdivision"
        ],
        mapper: {
            serializedName: "municipalitySubdivision",
            type: {
                name: "String"
            }
        }
    };
    var number = {
        parameterPath: [
            "options",
            "number"
        ],
        mapper: {
            serializedName: "number",
            type: {
                name: "String"
            }
        }
    };
    var numberOfClosestPoints = {
        parameterPath: [
            "options",
            "numberOfClosestPoints"
        ],
        mapper: {
            serializedName: "numberOfClosestPoints",
            type: {
                name: "Number"
            }
        }
    };
    var objectType = {
        parameterPath: [
            "options",
            "objectType"
        ],
        mapper: {
            serializedName: "objectType",
            type: {
                name: "Sequence",
                element: {
                    type: {
                        name: "Enum",
                        allowedValues: [
                            "stop",
                            "docklessBike",
                            "docklessElectricBike",
                            "docklessElectricScooter",
                            "docklessScooter",
                            "docklessMoped",
                            "carShare",
                            "docklessVehicle",
                            "bikeDock"
                        ]
                    }
                }
            }
        },
        collectionFormat: QueryCollectionFormat.Csv
    };
    var ofs0 = {
        parameterPath: [
            "options",
            "ofs"
        ],
        mapper: {
            serializedName: "ofs",
            constraints: {
                InclusiveMaximum: 1900,
                InclusiveMinimum: 0
            },
            type: {
                name: "Number"
            }
        }
    };
    var ofs1 = {
        parameterPath: [
            "options",
            "ofs"
        ],
        mapper: {
            serializedName: "ofs",
            constraints: {
                InclusiveMinimum: 0
            },
            type: {
                name: "Number"
            }
        }
    };
    var ofs2 = {
        parameterPath: [
            "options",
            "ofs"
        ],
        mapper: {
            serializedName: "ofs",
            type: {
                name: "Number"
            }
        }
    };
    var openingHours = {
        parameterPath: [
            "options",
            "openingHours"
        ],
        mapper: {
            serializedName: "openingHours",
            type: {
                name: "Enum",
                allowedValues: [
                    "nextSevenDays"
                ]
            }
        }
    };
    var options = {
        parameterPath: [
            "options",
            "options"
        ],
        mapper: {
            serializedName: "options",
            type: {
                name: "Enum",
                allowedValues: [
                    "none",
                    "zoneInfo",
                    "transitions",
                    "all"
                ]
            }
        }
    };
    var origin = {
        parameterPath: "origin",
        mapper: {
            required: true,
            serializedName: "origin",
            type: {
                name: "String"
            }
        }
    };
    var originType = {
        parameterPath: [
            "options",
            "originType"
        ],
        mapper: {
            serializedName: "originType",
            type: {
                name: "Enum",
                allowedValues: [
                    "position",
                    "stopId",
                    "stopKey"
                ]
            }
        }
    };
    var path = {
        parameterPath: [
            "options",
            "path"
        ],
        mapper: {
            serializedName: "path",
            type: {
                name: "Sequence",
                element: {
                    type: {
                        name: "String"
                    }
                }
            }
        },
        collectionFormat: QueryCollectionFormat.Multi
    };
    var pins = {
        parameterPath: [
            "options",
            "pins"
        ],
        mapper: {
            serializedName: "pins",
            type: {
                name: "Sequence",
                element: {
                    type: {
                        name: "String"
                    }
                }
            }
        },
        collectionFormat: QueryCollectionFormat.Multi
    };
    var postalCode = {
        parameterPath: [
            "options",
            "postalCode"
        ],
        mapper: {
            serializedName: "postalCode",
            type: {
                name: "String"
            }
        }
    };
    var query0 = {
        parameterPath: "query",
        mapper: {
            required: true,
            serializedName: "query",
            type: {
                name: "String"
            }
        }
    };
    var query1 = {
        parameterPath: "query",
        mapper: {
            required: true,
            serializedName: "query",
            type: {
                name: "Number"
            }
        }
    };
    var queryType0 = {
        parameterPath: [
            "options",
            "queryType"
        ],
        mapper: {
            serializedName: "queryType",
            type: {
                name: "Enum",
                allowedValues: [
                    "position",
                    "countryCode"
                ]
            }
        }
    };
    var queryType1 = {
        parameterPath: [
            "options",
            "queryType"
        ],
        mapper: {
            serializedName: "queryType",
            type: {
                name: "Enum",
                allowedValues: [
                    "stopId",
                    "stopKey"
                ]
            }
        }
    };
    var queryType2 = {
        parameterPath: [
            "options",
            "queryType"
        ],
        mapper: {
            serializedName: "queryType",
            type: {
                name: "Enum",
                allowedValues: [
                    "stops",
                    "line",
                    "lineAndStop",
                    "position"
                ]
            }
        }
    };
    var radius = {
        parameterPath: [
            "options",
            "radius"
        ],
        mapper: {
            serializedName: "radius",
            type: {
                name: "Number"
            }
        }
    };
    var report = {
        parameterPath: [
            "options",
            "report"
        ],
        mapper: {
            serializedName: "report",
            type: {
                name: "String"
            }
        }
    };
    var returnMatchType = {
        parameterPath: [
            "options",
            "returnMatchType"
        ],
        mapper: {
            serializedName: "returnMatchType",
            type: {
                name: "Boolean"
            }
        }
    };
    var returnRoadUse = {
        parameterPath: [
            "options",
            "returnRoadUse"
        ],
        mapper: {
            serializedName: "returnRoadUse",
            type: {
                name: "Boolean"
            }
        }
    };
    var returnSpeedLimit = {
        parameterPath: [
            "options",
            "returnSpeedLimit"
        ],
        mapper: {
            serializedName: "returnSpeedLimit",
            type: {
                name: "Boolean"
            }
        }
    };
    var roadUse = {
        parameterPath: [
            "options",
            "roadUse"
        ],
        mapper: {
            serializedName: "roadUse",
            type: {
                name: "String"
            }
        }
    };
    var routeRepresentation = {
        parameterPath: [
            "options",
            "routeRepresentation"
        ],
        mapper: {
            serializedName: "routeRepresentation",
            type: {
                name: "Enum",
                allowedValues: [
                    "polyline",
                    "summaryOnly",
                    "none"
                ]
            }
        }
    };
    var routeType0 = {
        parameterPath: [
            "options",
            "routeType"
        ],
        mapper: {
            serializedName: "routeType",
            type: {
                name: "Enum",
                allowedValues: [
                    "fastest",
                    "shortest",
                    "eco",
                    "thrilling"
                ]
            }
        }
    };
    var routeType1 = {
        parameterPath: [
            "options",
            "routeType"
        ],
        mapper: {
            serializedName: "routeType",
            type: {
                name: "Enum",
                allowedValues: [
                    "optimal",
                    "leastWalk",
                    "leastTransfers"
                ]
            }
        }
    };
    var searchBuffer = {
        parameterPath: [
            "options",
            "searchBuffer"
        ],
        mapper: {
            serializedName: "searchBuffer",
            constraints: {
                InclusiveMaximum: 500,
                InclusiveMinimum: 0
            },
            type: {
                name: "Number"
            }
        }
    };
    var sectionType = {
        parameterPath: [
            "options",
            "sectionType"
        ],
        mapper: {
            serializedName: "sectionType",
            type: {
                name: "Enum",
                allowedValues: [
                    "carTrain",
                    "country",
                    "ferry",
                    "motorway",
                    "pedestrian",
                    "tollRoad",
                    "tollVignette",
                    "traffic",
                    "travelMode",
                    "tunnel"
                ]
            }
        }
    };
    var stopQueryType = {
        parameterPath: [
            "options",
            "stopQueryType"
        ],
        mapper: {
            serializedName: "stopQueryType",
            type: {
                name: "Enum",
                allowedValues: [
                    "stopId",
                    "stopKey"
                ]
            }
        }
    };
    var streetName = {
        parameterPath: [
            "options",
            "streetName"
        ],
        mapper: {
            serializedName: "streetName",
            type: {
                name: "String"
            }
        }
    };
    var streetNumber = {
        parameterPath: [
            "options",
            "streetNumber"
        ],
        mapper: {
            serializedName: "streetNumber",
            type: {
                name: "String"
            }
        }
    };
    var style0 = {
        parameterPath: [
            "options",
            "style"
        ],
        mapper: {
            serializedName: "style",
            type: {
                name: "String"
            }
        }
    };
    var style1 = {
        parameterPath: "style",
        mapper: {
            required: true,
            serializedName: "style",
            type: {
                name: "Enum",
                allowedValues: [
                    "main",
                    "shaded_relief"
                ]
            }
        }
    };
    var style2 = {
        parameterPath: "style",
        mapper: {
            required: true,
            isConstant: true,
            serializedName: "style",
            defaultValue: 'satellite',
            type: {
                name: "String"
            }
        }
    };
    var territory = {
        parameterPath: [
            "options",
            "territory"
        ],
        mapper: {
            serializedName: "territory",
            type: {
                name: "String"
            }
        }
    };
    var text = {
        parameterPath: [
            "options",
            "text"
        ],
        mapper: {
            serializedName: "text",
            type: {
                name: "String"
            }
        }
    };
    var tileSize = {
        parameterPath: [
            "options",
            "tileSize"
        ],
        mapper: {
            serializedName: "tileSize",
            type: {
                name: "Number"
            }
        }
    };
    var time = {
        parameterPath: [
            "options",
            "time"
        ],
        mapper: {
            serializedName: "time",
            type: {
                name: "String"
            }
        }
    };
    var timeBudgetInSec = {
        parameterPath: [
            "options",
            "timeBudgetInSec"
        ],
        mapper: {
            serializedName: "timeBudgetInSec",
            type: {
                name: "Number"
            }
        }
    };
    var timeoutInSeconds = {
        parameterPath: [
            "options",
            "timeoutInSeconds"
        ],
        mapper: {
            serializedName: "timeoutInSeconds",
            type: {
                name: "Number"
            }
        }
    };
    var timeStamp = {
        parameterPath: [
            "options",
            "timeStamp"
        ],
        mapper: {
            serializedName: "timeStamp",
            type: {
                name: "DateTime"
            }
        }
    };
    var timeType = {
        parameterPath: [
            "options",
            "timeType"
        ],
        mapper: {
            serializedName: "timeType",
            type: {
                name: "Enum",
                allowedValues: [
                    "arrival",
                    "departure",
                    "last"
                ]
            }
        }
    };
    var topLeft = {
        parameterPath: [
            "options",
            "topLeft"
        ],
        mapper: {
            serializedName: "topLeft",
            type: {
                name: "String"
            }
        }
    };
    var traffic = {
        parameterPath: [
            "options",
            "traffic"
        ],
        mapper: {
            serializedName: "traffic",
            type: {
                name: "Boolean"
            }
        }
    };
    var transitionsFrom = {
        parameterPath: [
            "options",
            "transitionsFrom"
        ],
        mapper: {
            serializedName: "transitionsFrom",
            type: {
                name: "DateTime"
            }
        }
    };
    var transitionsYears = {
        parameterPath: [
            "options",
            "transitionsYears"
        ],
        mapper: {
            serializedName: "transitionsYears",
            type: {
                name: "Number"
            }
        }
    };
    var transitType = {
        parameterPath: [
            "options",
            "transitType"
        ],
        mapper: {
            serializedName: "transitType",
            type: {
                name: "Sequence",
                element: {
                    type: {
                        name: "Enum",
                        allowedValues: [
                            "bus",
                            "cableCar",
                            "ferry",
                            "funicular",
                            "gondola",
                            "rail",
                            "tram",
                            "subway"
                        ]
                    }
                }
            }
        },
        collectionFormat: QueryCollectionFormat.Csv
    };
    var travelMode = {
        parameterPath: [
            "options",
            "travelMode"
        ],
        mapper: {
            serializedName: "travelMode",
            type: {
                name: "Enum",
                allowedValues: [
                    "car",
                    "truck",
                    "taxi",
                    "bus",
                    "van",
                    "motorcycle",
                    "bicycle",
                    "pedestrian"
                ]
            }
        }
    };
    var typeahead = {
        parameterPath: [
            "options",
            "typeahead"
        ],
        mapper: {
            serializedName: "typeahead",
            type: {
                name: "Boolean"
            }
        }
    };
    var udid = {
        parameterPath: "udid",
        mapper: {
            required: true,
            serializedName: "udid",
            type: {
                name: "String"
            }
        }
    };
    var udId = {
        parameterPath: "udId",
        mapper: {
            required: true,
            serializedName: "udId",
            type: {
                name: "String"
            }
        }
    };
    var uphillEfficiency = {
        parameterPath: [
            "options",
            "uphillEfficiency"
        ],
        mapper: {
            serializedName: "uphillEfficiency",
            type: {
                name: "Number"
            }
        }
    };
    var userTime = {
        parameterPath: [
            "options",
            "userTime"
        ],
        mapper: {
            serializedName: "userTime",
            type: {
                name: "String"
            }
        }
    };
    var vehicleAxleWeight = {
        parameterPath: [
            "options",
            "vehicleAxleWeight"
        ],
        mapper: {
            serializedName: "vehicleAxleWeight",
            type: {
                name: "Number"
            }
        }
    };
    var vehicleCommercial = {
        parameterPath: [
            "options",
            "vehicleCommercial"
        ],
        mapper: {
            serializedName: "vehicleCommercial",
            type: {
                name: "Boolean"
            }
        }
    };
    var vehicleEngineType = {
        parameterPath: [
            "options",
            "vehicleEngineType"
        ],
        mapper: {
            serializedName: "vehicleEngineType",
            type: {
                name: "Enum",
                allowedValues: [
                    "combustion",
                    "electric"
                ]
            }
        }
    };
    var vehicleHeading = {
        parameterPath: [
            "options",
            "vehicleHeading"
        ],
        mapper: {
            serializedName: "vehicleHeading",
            constraints: {
                InclusiveMaximum: 359,
                InclusiveMinimum: 0
            },
            type: {
                name: "Number"
            }
        }
    };
    var vehicleHeight = {
        parameterPath: [
            "options",
            "vehicleHeight"
        ],
        mapper: {
            serializedName: "vehicleHeight",
            type: {
                name: "Number"
            }
        }
    };
    var vehicleLength = {
        parameterPath: [
            "options",
            "vehicleLength"
        ],
        mapper: {
            serializedName: "vehicleLength",
            type: {
                name: "Number"
            }
        }
    };
    var vehicleLoadType = {
        parameterPath: [
            "options",
            "vehicleLoadType"
        ],
        mapper: {
            serializedName: "vehicleLoadType",
            type: {
                name: "Enum",
                allowedValues: [
                    "USHazmatClass1",
                    "USHazmatClass2",
                    "USHazmatClass3",
                    "USHazmatClass4",
                    "USHazmatClass5",
                    "USHazmatClass6",
                    "USHazmatClass7",
                    "USHazmatClass8",
                    "USHazmatClass9",
                    "otherHazmatExplosive",
                    "otherHazmatGeneral",
                    "otherHazmatHarmfulToWater"
                ]
            }
        }
    };
    var vehicleMaxSpeed = {
        parameterPath: [
            "options",
            "vehicleMaxSpeed"
        ],
        mapper: {
            serializedName: "vehicleMaxSpeed",
            type: {
                name: "Number"
            }
        }
    };
    var vehicleWeight = {
        parameterPath: [
            "options",
            "vehicleWeight"
        ],
        mapper: {
            serializedName: "vehicleWeight",
            type: {
                name: "Number"
            }
        }
    };
    var vehicleWidth = {
        parameterPath: [
            "options",
            "vehicleWidth"
        ],
        mapper: {
            serializedName: "vehicleWidth",
            type: {
                name: "Number"
            }
        }
    };
    var view = {
        parameterPath: [
            "options",
            "view"
        ],
        mapper: {
            serializedName: "view",
            type: {
                name: "String"
            }
        }
    };
    var waitForResults = {
        parameterPath: [
            "options",
            "waitForResults"
        ],
        mapper: {
            serializedName: "waitForResults",
            type: {
                name: "Boolean"
            }
        }
    };
    var width = {
        parameterPath: [
            "options",
            "width"
        ],
        mapper: {
            serializedName: "width",
            constraints: {
                InclusiveMaximum: 8192,
                InclusiveMinimum: 1
            },
            type: {
                name: "Number"
            }
        }
    };
    var windingness = {
        parameterPath: [
            "options",
            "windingness"
        ],
        mapper: {
            serializedName: "windingness",
            type: {
                name: "Enum",
                allowedValues: [
                    "low",
                    "normal",
                    "high"
                ]
            }
        }
    };
    var xTileIndex = {
        parameterPath: "xTileIndex",
        mapper: {
            required: true,
            serializedName: "x",
            type: {
                name: "Number"
            }
        }
    };
    var yTileIndex = {
        parameterPath: "yTileIndex",
        mapper: {
            required: true,
            serializedName: "y",
            type: {
                name: "Number"
            }
        }
    };
    var zoom0 = {
        parameterPath: [
            "options",
            "zoom"
        ],
        mapper: {
            serializedName: "zoom",
            constraints: {
                InclusiveMaximum: 20,
                InclusiveMinimum: 0
            },
            type: {
                name: "Number"
            }
        }
    };
    var zoom1 = {
        parameterPath: "zoom",
        mapper: {
            required: true,
            serializedName: "zoom",
            type: {
                name: "Number"
            }
        }
    };

    /*
     * Code generated by Microsoft (R) AutoRest Code Generator.
     * Changes may cause incorrect behavior and will be lost if the code is
     * regenerated.
     */
    /** Class representing a Search. */
    var Search = /** @class */ (function () {
        /**
         * Create a Search.
         * @param {MapsClientContext} client Reference to the service client.
         */
        function Search(client) {
            this.client = client;
        }
        Search.prototype.getSearchPolygon = function (geometries, options, callback) {
            return this.client.sendOperationRequest({
                geometries: geometries,
                options: options
            }, getSearchPolygonOperationSpec, callback);
        };
        Search.prototype.getSearchFuzzy = function (query, options, callback) {
            return this.client.sendOperationRequest({
                query: query,
                options: options
            }, getSearchFuzzyOperationSpec, callback);
        };
        Search.prototype.getSearchPOI = function (query, options, callback) {
            return this.client.sendOperationRequest({
                query: query,
                options: options
            }, getSearchPOIOperationSpec, callback);
        };
        Search.prototype.getSearchNearby = function (lat, lon, options, callback) {
            return this.client.sendOperationRequest({
                lat: lat,
                lon: lon,
                options: options
            }, getSearchNearbyOperationSpec, callback);
        };
        Search.prototype.getSearchPOICategory = function (query, options, callback) {
            return this.client.sendOperationRequest({
                query: query,
                options: options
            }, getSearchPOICategoryOperationSpec, callback);
        };
        Search.prototype.getSearchAddress = function (query, options, callback) {
            return this.client.sendOperationRequest({
                query: query,
                options: options
            }, getSearchAddressOperationSpec, callback);
        };
        Search.prototype.getSearchAddressReverse = function (query, options, callback) {
            return this.client.sendOperationRequest({
                query: query,
                options: options
            }, getSearchAddressReverseOperationSpec, callback);
        };
        Search.prototype.getSearchAddressReverseCrossStreet = function (query, options, callback) {
            return this.client.sendOperationRequest({
                query: query,
                options: options
            }, getSearchAddressReverseCrossStreetOperationSpec, callback);
        };
        Search.prototype.getSearchAddressStructured = function (countryCode, options, callback) {
            return this.client.sendOperationRequest({
                countryCode: countryCode,
                options: options
            }, getSearchAddressStructuredOperationSpec, callback);
        };
        Search.prototype.postSearchInsideGeometry = function (query, searchInsideGeometryRequestBody, options, callback) {
            return this.client.sendOperationRequest({
                query: query,
                searchInsideGeometryRequestBody: searchInsideGeometryRequestBody,
                options: options
            }, postSearchInsideGeometryOperationSpec, callback);
        };
        Search.prototype.postSearchAlongRoute = function (query, maxDetourTime, searchAlongRouteRequestBody, options, callback) {
            return this.client.sendOperationRequest({
                query: query,
                maxDetourTime: maxDetourTime,
                searchAlongRouteRequestBody: searchAlongRouteRequestBody,
                options: options
            }, postSearchAlongRouteOperationSpec, callback);
        };
        /**
         * **Search Fuzzy Batch API**
         *
         *
         * **Applies to**: S1 pricing tier.
         *
         *
         *
         * The Search Fuzzy Batch API allows the caller to batch up to 10,000 [Search Fuzzy
         * API](https://docs.microsoft.com/en-us/rest/api/maps/search/getsearchfuzzy) queries/requests
         * using just a single API call.
         * ### Submit Batch Request
         * To send the _search fuzzy_ queries you will use a `POST` request where the request body will
         * contain the `batchItems` array in `json` format and the `Content-Type` header will be set to
         * `application/json`. Here's a sample request body containing 5 _search fuzzy_ queries:
         *
         *
         * ```json
         * {
         * "batchItems": [
         * {"query": "?query=atm&lat=47.639769&lon=-122.128362&radius=5000&limit=5"},
         * {"query": "?query=Statue Of Liberty&limit=2"},
         * {"query": "?query=Starbucks&lat=47.639769&lon=-122.128362&radius=5000"},
         * {"query": "?query=Space Needle"},
         * {"query": "?query=pizza&limit=10"}
         * ]
         * }
         * ```
         *
         * A _search fuzzy_ query in a batch is just a partial URL _without_ the protocol, base URL, path,
         * api-version and subscription-key. It can accept any of the supported _search fuzzy_ [URI
         * parameters](https://docs.microsoft.com/en-us/rest/api/maps/search/getsearchfuzzy#uri-parameters).
         * The string values in the _search fuzzy_ query must be properly escaped (e.g. " character should
         * be escaped with \\ ) and it should also be properly URL-encoded.
         *
         *
         * The maximum number of queries that can be specified in the batch is **10,000** and the batch
         * should contain at least **1** query.
         *
         *
         * Please note that the Search Fuzzy Batch API is a long-running request. Here's a typical sequence
         * of operations:
         * 1. Client sends a Search Fuzzy Batch `POST` request to Azure Maps
         * 2. The server will respond with one of the following:
         *
         * > HTTP `202 Accepted` - Batch request has been accepted.
         *
         * > HTTP `Error` - There was an error processing your Batch request. This could either be a `400
         * Bad Request` or any other `Error` status code.
         *
         * 3. If the batch request was accepted successfully, the `Location` header in the response
         * contains the URL to download the results of the batch request.
         * 4. Client issues a `GET` request on the _download URL_ obtained in Step 3 to download the batch
         * results.
         *
         *
         *
         * ### Download Batch Results
         * To download the batch results you will issue a `GET` request to the batch download endpoint.
         * This _download URL_ can be obtained from the `Location` header of a successful `POST` batch
         * request and looks like the following:
         *
         *
         * ```
         * https://atlas.microsoft.com/batch/{batch-id}?api-version=1.0&subscription-key={subscription-key}
         * ```
         *
         * Here's the typical sequence of operations for downloading the batch results:
         * 1. Client sends a `GET` request using the _download URL_.
         * 2. The server will respond with one of the following:
         *
         * > HTTP `202 Accepted` - Batch request was accepted but is still being processed. Please try
         * again in some time.
         *
         * > HTTP `200 OK` - Batch request successfully processed. The response body contains all the batch
         * results.
         *
         *
         *
         * ### Batch Response Model
         * When downloading the results of a batch request, if the batch has finished processing, the
         * response body contains the batch response. This batch response contains a `summary` component
         * that indicates the `totalRequests` that were part of the original batch request and
         * `successfulRequests` i.e. queries which were executed successfully. The batch response also
         * includes a `batchItems` array which contains a response for each and every query in the batch
         * request. Also, the `batchItems` will contain the results in the exact same order the original
         * queries were sent in the batch request. Each item in `batchItems` contains `statusCode` and
         * `response` fields. Each `response` in `batchItems` is of one of the following types:
         *
         * -
         * [`SearchFuzzyResponse`](https://docs.microsoft.com/en-us/rest/api/maps/search/getsearchfuzzy#searchfuzzyresponse)
         * - If the query completed successfully.
         *
         * - `Error` - If the query failed. The result will contain a `status code` and a `message` in this
         * case.
         *
         *
         * Here's a sample Batch Response with 2 _successful_ and 1 _failed_ result:
         *
         *
         * ```json
         * {
         * "summary": {
         * "successfulRequests": 2,
         * "totalRequests": 3
         * },
         * "batchItems": [
         * {
         * "statusCode": 200,
         * "response":
         * {
         * "summary": {
         * "query": "atm"
         * },
         * "results": [
         * {
         * "type": "POI",
         * "poi": {
         * "name": "ATM at Wells Fargo"
         * },
         * "address": {
         * "country": "United States Of America",
         * "freeformAddress": "3240 157th Ave NE, Redmond, WA 98052"
         * }
         * }
         * ]
         * }
         * },
         * {
         * "statusCode": 200,
         * "response":
         * {
         * "summary": {
         * "query": "statue of liberty"
         * },
         * "results": [
         * {
         * "type": "POI",
         * "poi": {
         * "name": "Statue of Liberty"
         * },
         * "address": {
         * "country": "United States Of America",
         * "freeformAddress": "New York, NY 10004"
         * }
         * }
         * ]
         * }
         * },
         * {
         * "statusCode": 400,
         * "response":
         * {
         * "error":
         * {
         * "code": "400 BadRequest",
         * "message": "Bad request: one or more parameters were incorrectly specified or are mutually
         * exclusive."
         * }
         * }
         * }
         * ]
         * }
         * ```
         *
         *
         * ### Data Retention Period
         * Please, be aware that batch results are available for download for **14** days, after which the
         * request for results download will return `404 Not Found` response.
         * @param searchFuzzyBatchRequestBody The list of search fuzzy queries/requests to process. The
         * list can contain  a max of 10,000 queries and must contain at least 1 query.
         * @param [options] The optional parameters
         * @returns Promise<Models.SearchPostSearchFuzzyBatchPreviewResponse>
         */
        Search.prototype.postSearchFuzzyBatchPreview = function (searchFuzzyBatchRequestBody, options) {
            return this.beginPostSearchFuzzyBatchPreview(searchFuzzyBatchRequestBody, options)
                .then(function (lroPoller) { return lroPoller.pollUntilFinished(); });
        };
        /**
         * **Search Address Batch API**
         *
         *
         * **Applies to**: S1 pricing tier.
         *
         *
         *
         * The Search Address Batch API allows the caller to batch up to 10,000 [Search Address
         * API](https://docs.microsoft.com/en-us/rest/api/maps/search/getsearchaddress) queries/requests
         * using just a single API call.
         * ### Submit Batch Request
         * To send the _search address_ queries you will use a `POST` request where the request body will
         * contain the `batchItems` array in `json` format and the `Content-Type` header will be set to
         * `application/json`. Here's a sample request body containing 5 _search address_ queries:
         *
         *
         * ```json
         * {
         * "batchItems": [
         * {"query": "?query=400 Broad St, Seattle, WA 98109&limit=3"},
         * {"query": "?query=One, Microsoft Way, Redmond, WA 98052&limit=3"},
         * {"query": "?query=350 5th Ave, New York, NY 10118&limit=1"},
         * {"query": "?query=Pike Pl, Seattle, WA 98101&lat=47.610970&lon=-122.342469&radius=1000"},
         * {"query": "?query=Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France&limit=1"}
         * ]
         * }
         * ```
         *
         * A _search address_ query in a batch is just a partial URL _without_ the protocol, base URL,
         * path, api-version and subscription-key. It can accept any of the supported _search address_ [URI
         * parameters](https://docs.microsoft.com/en-us/rest/api/maps/search/getsearchaddress#uri-parameters).
         * The string values in the _search address_ query must be properly escaped (e.g. " character
         * should be escaped with \\ ) and it should also be properly URL-encoded.
         *
         *
         * The maximum number of queries that can be specified in the batch is **10,000** and the batch
         * should contain at least **1** query.
         *
         *
         * Please note that the Search Address Batch API is a long-running request. Here's a typical
         * sequence of operations:
         * 1. Client sends a Search Address Batch `POST` request to Azure Maps
         * 2. The server will respond with one of the following:
         *
         * > HTTP `202 Accepted` - Batch request has been accepted.
         *
         * > HTTP `Error` - There was an error processing your Batch request. This could either be a `400
         * Bad Request` or any other `Error` status code.
         *
         * 3. If the batch request was accepted successfully, the `Location` header in the response
         * contains the URL to download the results of the batch request.
         * 4. Client issues a `GET` request on the _download URL_ obtained in Step 3 to download the batch
         * results.
         *
         *
         *
         * ### Download Batch Results
         * To download the batch results you will issue a `GET` request to the batch download endpoint.
         * This _download URL_ can be obtained from the `Location` header of a successful `POST` batch
         * request and looks like the following:
         *
         *
         * ```
         * https://atlas.microsoft.com/batch/{batch-id}?api-version=1.0&subscription-key={subscription-key}
         * ```
         *
         * Here's the typical sequence of operations for downloading the batch results:
         * 1. Client sends a `GET` request using the _download URL_.
         * 2. The server will respond with one of the following:
         *
         * > HTTP `202 Accepted` - Batch request was accepted but is still being processed. Please try
         * again in some time.
         *
         * > HTTP `200 OK` - Batch request successfully processed. The response body contains all the batch
         * results.
         *
         *
         *
         * ### Batch Response Model
         * When downloading the results of a batch request, if the batch has finished processing, the
         * response body contains the batch response. This batch response contains a `summary` component
         * that indicates the `totalRequests` that were part of the original batch request and
         * `successfulRequests` i.e. queries which were executed successfully. The batch response also
         * includes a `batchItems` array which contains a response for each and every query in the batch
         * request. Also, the `batchItems` will contain the results in the exact same order the original
         * queries were sent in the batch request. Each item in `batchItems` contains `statusCode` and
         * `response` fields. Each `response` in `batchItems` is of one of the following types:
         *
         * -
         * [`SearchAddressResponse`](https://docs.microsoft.com/en-us/rest/api/maps/search/getsearchaddress#searchaddressresponse)
         * - If the query completed successfully.
         *
         * - `Error` - If the query failed. The result will contain a `status code` and a `message` in this
         * case.
         *
         *
         * Here's a sample Batch Response with 2 _successful_ and 1 _failed_ result:
         *
         *
         * ```json
         * {
         * "summary": {
         * "successfulRequests": 2,
         * "totalRequests": 3
         * },
         * "batchItems": [
         * {
         * "statusCode": 200,
         * "response":
         * {
         * "summary": {
         * "query": "one microsoft way redmond wa 98052"
         * },
         * "results": [
         * {
         * "position": {
         * "lat": 47.63989,
         * "lon": -122.12509
         * }
         * }
         * ]
         * }
         * },
         * {
         * "statusCode": 200,
         * "response":
         * {
         * "summary": {
         * "query": "pike pl seattle wa 98101"
         * },
         * "results": [
         * {
         * "position": {
         * "lat": 47.60963,
         * "lon": -122.34215
         * }
         * }
         * ]
         * }
         * },
         * {
         * "statusCode": 400,
         * "response":
         * {
         * "error":
         * {
         * "code": "400 BadRequest",
         * "message": "Bad request: one or more parameters were incorrectly specified or are mutually
         * exclusive."
         * }
         * }
         * }
         * ]
         * }
         * ```
         *
         *
         * ### Data Retention Period
         * Please, be aware that batch results are available for download for **14** days, after which the
         * request for results download will return `404 Not Found` response.
         * @param searchAddressBatchRequestBody The list of address geocoding queries/requests to process.
         * The list can contain  a max of 10,000 queries and must contain at least 1 query.
         * @param [options] The optional parameters
         * @returns Promise<Models.SearchPostSearchAddressBatchPreviewResponse>
         */
        Search.prototype.postSearchAddressBatchPreview = function (searchAddressBatchRequestBody, options) {
            return this.beginPostSearchAddressBatchPreview(searchAddressBatchRequestBody, options)
                .then(function (lroPoller) { return lroPoller.pollUntilFinished(); });
        };
        /**
         * **Search Address Reverse Batch API**
         *
         *
         * **Applies to**: S1 pricing tier.
         *
         *
         *
         * The Search Address Reverse Batch API allows the caller to batch up to 10,000 [Search Address
         * Reverse API](https://docs.microsoft.com/en-us/rest/api/maps/search/getsearchaddressreverse)
         * queries/requests using just a single API call.
         * ### Submit Batch Request
         * To send the _search address reverse_ queries you will use a `POST` request where the request
         * body will contain the `batchItems` array in `json` format and the `Content-Type` header will be
         * set to `application/json`. Here's a sample request body containing 5 _search address reverse_
         * queries:
         *
         *
         * ```json
         * {
         * "batchItems": [
         * {"query": "?query=48.858561,2.294911"},
         * {"query": "?query=47.639765,-122.127896&radius=5000&limit=2"},
         * {"query": "?query=47.621028,-122.348170"},
         * {"query": "?query=43.722990,10.396695"},
         * {"query": "?query=40.750958,-73.982336"}
         * ]
         * }
         * ```
         *
         * A _search address reverse_ query in a batch is just a partial URL _without_ the protocol, base
         * URL, path, api-version and subscription-key. It can accept any of the supported _search address
         * reverse_ [URI
         * parameters](https://docs.microsoft.com/en-us/rest/api/maps/search/getsearchaddressreverse#uri-parameters).
         * The string values in the _search address reverse_ query must be properly escaped (e.g. "
         * character should be escaped with \\ ) and it should also be properly URL-encoded.
         *
         *
         * The maximum number of queries that can be specified in the batch is **10,000** and the batch
         * should contain at least **1** query.
         *
         *
         * Please note that the Search Address Reverse Batch API is a long-running request. Here's a
         * typical sequence of operations:
         * 1. Client sends a Search Address Reverse Batch `POST` request to Azure Maps
         * 2. The server will respond with one of the following:
         *
         * > HTTP `202 Accepted` - Batch request has been accepted.
         *
         * > HTTP `Error` - There was an error processing your Batch request. This could either be a `400
         * Bad Request` or any other `Error` status code.
         *
         * 3. If the batch request was accepted successfully, the `Location` header in the response
         * contains the URL to download the results of the batch request.
         * 4. Client issues a `GET` request on the _download URL_ obtained in Step 3 to download the batch
         * results.
         *
         *
         *
         * ### Download Batch Results
         * To download the batch results you will issue a `GET` request to the batch download endpoint.
         * This _download URL_ can be obtained from the `Location` header of a successful `POST` batch
         * request and looks like the following:
         *
         *
         * ```
         * https://atlas.microsoft.com/batch/{batch-id}?api-version=1.0&subscription-key={subscription-key}
         * ```
         *
         * Here's the typical sequence of operations for downloading the batch results:
         * 1. Client sends a `GET` request using the _download URL_.
         * 2. The server will respond with one of the following:
         *
         * > HTTP `202 Accepted` - Batch request was accepted but is still being processed. Please try
         * again in some time.
         *
         * > HTTP `200 OK` - Batch request successfully processed. The response body contains all the batch
         * results.
         *
         *
         *
         * ### Batch Response Model
         * When downloading the results of a batch request, if the batch has finished processing, the
         * response body contains the batch response. This batch response contains a `summary` component
         * that indicates the `totalRequests` that were part of the original batch request and
         * `successfulRequests` i.e. queries which were executed successfully. The batch response also
         * includes a `batchItems` array which contains a response for each and every query in the batch
         * request. Also, the `batchItems` will contain the results in the exact same order the original
         * queries were sent in the batch request. Each item in `batchItems` contains `statusCode` and
         * `response` fields. Each `response` in `batchItems` is of one of the following types:
         *
         * -
         * [`SearchAddressReverseResponse`](https://docs.microsoft.com/en-us/rest/api/maps/search/getsearchaddressreverse#searchaddressreverseresponse)
         * - If the query completed successfully.
         *
         * - `Error` - If the query failed. The result will contain a `status code` and a `message` in this
         * case.
         *
         *
         * Here's a sample Batch Response with 2 _successful_ and 1 _failed_ result:
         *
         *
         * ```json
         * {
         * "summary": {
         * "successfulRequests": 2,
         * "totalRequests": 3
         * },
         * "batchItems": [
         * {
         * "statusCode": 200,
         * "response":
         * {
         * "summary": {
         * "queryTime": 11
         * },
         * "addresses": [
         * {
         * "address": {
         * "country": "France",
         * "freeformAddress": "Avenue Anatole France, 75007 Paris"
         * },
         * "position": "48.858490,2.294820"
         * }
         * ]
         * }
         * },
         * {
         * "statusCode": 200,
         * "response":
         * {
         * "summary": {
         * "queryTime": 1
         * },
         * "addresses": [
         * {
         * "address": {
         * "country": "United States of America",
         * "freeformAddress": "157th Pl NE, Redmond WA 98052"
         * },
         * "position": "47.640470,-122.129430"
         * }
         * ]
         * }
         * },
         * {
         * "statusCode": 400,
         * "response":
         * {
         * "error":
         * {
         * "code": "400 BadRequest",
         * "message": "Bad request: one or more parameters were incorrectly specified or are mutually
         * exclusive."
         * }
         * }
         * }
         * ]
         * }
         * ```
         *
         *
         * ### Data Retention Period
         * Please, be aware that batch results are available for download for **14** days, after which the
         * request for results download will return `404 Not Found` response.
         * @param searchAddressReverseBatchRequestBody The list of reverse geocoding queries/requests to
         * process. The list can contain  a max of 10,000 queries and must contain at least 1 query.
         * @param [options] The optional parameters
         * @returns Promise<Models.SearchPostSearchAddressReverseBatchPreviewResponse>
         */
        Search.prototype.postSearchAddressReverseBatchPreview = function (searchAddressReverseBatchRequestBody, options) {
            return this.beginPostSearchAddressReverseBatchPreview(searchAddressReverseBatchRequestBody, options)
                .then(function (lroPoller) { return lroPoller.pollUntilFinished(); });
        };
        /**
         * **Search Fuzzy Batch API**
         *
         *
         * **Applies to**: S1 pricing tier.
         *
         *
         *
         * The Search Fuzzy Batch API allows the caller to batch up to 10,000 [Search Fuzzy
         * API](https://docs.microsoft.com/en-us/rest/api/maps/search/getsearchfuzzy) queries/requests
         * using just a single API call.
         * ### Submit Batch Request
         * To send the _search fuzzy_ queries you will use a `POST` request where the request body will
         * contain the `batchItems` array in `json` format and the `Content-Type` header will be set to
         * `application/json`. Here's a sample request body containing 5 _search fuzzy_ queries:
         *
         *
         * ```json
         * {
         * "batchItems": [
         * {"query": "?query=atm&lat=47.639769&lon=-122.128362&radius=5000&limit=5"},
         * {"query": "?query=Statue Of Liberty&limit=2"},
         * {"query": "?query=Starbucks&lat=47.639769&lon=-122.128362&radius=5000"},
         * {"query": "?query=Space Needle"},
         * {"query": "?query=pizza&limit=10"}
         * ]
         * }
         * ```
         *
         * A _search fuzzy_ query in a batch is just a partial URL _without_ the protocol, base URL, path,
         * api-version and subscription-key. It can accept any of the supported _search fuzzy_ [URI
         * parameters](https://docs.microsoft.com/en-us/rest/api/maps/search/getsearchfuzzy#uri-parameters).
         * The string values in the _search fuzzy_ query must be properly escaped (e.g. " character should
         * be escaped with \\ ) and it should also be properly URL-encoded.
         *
         *
         * The maximum number of queries that can be specified in the batch is **10,000** and the batch
         * should contain at least **1** query.
         *
         *
         * Please note that the Search Fuzzy Batch API is a long-running request. Here's a typical sequence
         * of operations:
         * 1. Client sends a Search Fuzzy Batch `POST` request to Azure Maps
         * 2. The server will respond with one of the following:
         *
         * > HTTP `202 Accepted` - Batch request has been accepted.
         *
         * > HTTP `Error` - There was an error processing your Batch request. This could either be a `400
         * Bad Request` or any other `Error` status code.
         *
         * 3. If the batch request was accepted successfully, the `Location` header in the response
         * contains the URL to download the results of the batch request.
         * 4. Client issues a `GET` request on the _download URL_ obtained in Step 3 to download the batch
         * results.
         *
         *
         *
         * ### Download Batch Results
         * To download the batch results you will issue a `GET` request to the batch download endpoint.
         * This _download URL_ can be obtained from the `Location` header of a successful `POST` batch
         * request and looks like the following:
         *
         *
         * ```
         * https://atlas.microsoft.com/batch/{batch-id}?api-version=1.0&subscription-key={subscription-key}
         * ```
         *
         * Here's the typical sequence of operations for downloading the batch results:
         * 1. Client sends a `GET` request using the _download URL_.
         * 2. The server will respond with one of the following:
         *
         * > HTTP `202 Accepted` - Batch request was accepted but is still being processed. Please try
         * again in some time.
         *
         * > HTTP `200 OK` - Batch request successfully processed. The response body contains all the batch
         * results.
         *
         *
         *
         * ### Batch Response Model
         * When downloading the results of a batch request, if the batch has finished processing, the
         * response body contains the batch response. This batch response contains a `summary` component
         * that indicates the `totalRequests` that were part of the original batch request and
         * `successfulRequests` i.e. queries which were executed successfully. The batch response also
         * includes a `batchItems` array which contains a response for each and every query in the batch
         * request. Also, the `batchItems` will contain the results in the exact same order the original
         * queries were sent in the batch request. Each item in `batchItems` contains `statusCode` and
         * `response` fields. Each `response` in `batchItems` is of one of the following types:
         *
         * -
         * [`SearchFuzzyResponse`](https://docs.microsoft.com/en-us/rest/api/maps/search/getsearchfuzzy#searchfuzzyresponse)
         * - If the query completed successfully.
         *
         * - `Error` - If the query failed. The result will contain a `status code` and a `message` in this
         * case.
         *
         *
         * Here's a sample Batch Response with 2 _successful_ and 1 _failed_ result:
         *
         *
         * ```json
         * {
         * "summary": {
         * "successfulRequests": 2,
         * "totalRequests": 3
         * },
         * "batchItems": [
         * {
         * "statusCode": 200,
         * "response":
         * {
         * "summary": {
         * "query": "atm"
         * },
         * "results": [
         * {
         * "type": "POI",
         * "poi": {
         * "name": "ATM at Wells Fargo"
         * },
         * "address": {
         * "country": "United States Of America",
         * "freeformAddress": "3240 157th Ave NE, Redmond, WA 98052"
         * }
         * }
         * ]
         * }
         * },
         * {
         * "statusCode": 200,
         * "response":
         * {
         * "summary": {
         * "query": "statue of liberty"
         * },
         * "results": [
         * {
         * "type": "POI",
         * "poi": {
         * "name": "Statue of Liberty"
         * },
         * "address": {
         * "country": "United States Of America",
         * "freeformAddress": "New York, NY 10004"
         * }
         * }
         * ]
         * }
         * },
         * {
         * "statusCode": 400,
         * "response":
         * {
         * "error":
         * {
         * "code": "400 BadRequest",
         * "message": "Bad request: one or more parameters were incorrectly specified or are mutually
         * exclusive."
         * }
         * }
         * }
         * ]
         * }
         * ```
         *
         *
         * ### Data Retention Period
         * Please, be aware that batch results are available for download for **14** days, after which the
         * request for results download will return `404 Not Found` response.
         * @param searchFuzzyBatchRequestBody The list of search fuzzy queries/requests to process. The
         * list can contain  a max of 10,000 queries and must contain at least 1 query.
         * @param [options] The optional parameters
         * @returns Promise<msRestAzure.LROPoller>
         */
        Search.prototype.beginPostSearchFuzzyBatchPreview = function (searchFuzzyBatchRequestBody, options) {
            return this.client.sendLRORequest({
                searchFuzzyBatchRequestBody: searchFuzzyBatchRequestBody,
                options: options
            }, beginPostSearchFuzzyBatchPreviewOperationSpec, options);
        };
        /**
         * **Search Address Batch API**
         *
         *
         * **Applies to**: S1 pricing tier.
         *
         *
         *
         * The Search Address Batch API allows the caller to batch up to 10,000 [Search Address
         * API](https://docs.microsoft.com/en-us/rest/api/maps/search/getsearchaddress) queries/requests
         * using just a single API call.
         * ### Submit Batch Request
         * To send the _search address_ queries you will use a `POST` request where the request body will
         * contain the `batchItems` array in `json` format and the `Content-Type` header will be set to
         * `application/json`. Here's a sample request body containing 5 _search address_ queries:
         *
         *
         * ```json
         * {
         * "batchItems": [
         * {"query": "?query=400 Broad St, Seattle, WA 98109&limit=3"},
         * {"query": "?query=One, Microsoft Way, Redmond, WA 98052&limit=3"},
         * {"query": "?query=350 5th Ave, New York, NY 10118&limit=1"},
         * {"query": "?query=Pike Pl, Seattle, WA 98101&lat=47.610970&lon=-122.342469&radius=1000"},
         * {"query": "?query=Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France&limit=1"}
         * ]
         * }
         * ```
         *
         * A _search address_ query in a batch is just a partial URL _without_ the protocol, base URL,
         * path, api-version and subscription-key. It can accept any of the supported _search address_ [URI
         * parameters](https://docs.microsoft.com/en-us/rest/api/maps/search/getsearchaddress#uri-parameters).
         * The string values in the _search address_ query must be properly escaped (e.g. " character
         * should be escaped with \\ ) and it should also be properly URL-encoded.
         *
         *
         * The maximum number of queries that can be specified in the batch is **10,000** and the batch
         * should contain at least **1** query.
         *
         *
         * Please note that the Search Address Batch API is a long-running request. Here's a typical
         * sequence of operations:
         * 1. Client sends a Search Address Batch `POST` request to Azure Maps
         * 2. The server will respond with one of the following:
         *
         * > HTTP `202 Accepted` - Batch request has been accepted.
         *
         * > HTTP `Error` - There was an error processing your Batch request. This could either be a `400
         * Bad Request` or any other `Error` status code.
         *
         * 3. If the batch request was accepted successfully, the `Location` header in the response
         * contains the URL to download the results of the batch request.
         * 4. Client issues a `GET` request on the _download URL_ obtained in Step 3 to download the batch
         * results.
         *
         *
         *
         * ### Download Batch Results
         * To download the batch results you will issue a `GET` request to the batch download endpoint.
         * This _download URL_ can be obtained from the `Location` header of a successful `POST` batch
         * request and looks like the following:
         *
         *
         * ```
         * https://atlas.microsoft.com/batch/{batch-id}?api-version=1.0&subscription-key={subscription-key}
         * ```
         *
         * Here's the typical sequence of operations for downloading the batch results:
         * 1. Client sends a `GET` request using the _download URL_.
         * 2. The server will respond with one of the following:
         *
         * > HTTP `202 Accepted` - Batch request was accepted but is still being processed. Please try
         * again in some time.
         *
         * > HTTP `200 OK` - Batch request successfully processed. The response body contains all the batch
         * results.
         *
         *
         *
         * ### Batch Response Model
         * When downloading the results of a batch request, if the batch has finished processing, the
         * response body contains the batch response. This batch response contains a `summary` component
         * that indicates the `totalRequests` that were part of the original batch request and
         * `successfulRequests` i.e. queries which were executed successfully. The batch response also
         * includes a `batchItems` array which contains a response for each and every query in the batch
         * request. Also, the `batchItems` will contain the results in the exact same order the original
         * queries were sent in the batch request. Each item in `batchItems` contains `statusCode` and
         * `response` fields. Each `response` in `batchItems` is of one of the following types:
         *
         * -
         * [`SearchAddressResponse`](https://docs.microsoft.com/en-us/rest/api/maps/search/getsearchaddress#searchaddressresponse)
         * - If the query completed successfully.
         *
         * - `Error` - If the query failed. The result will contain a `status code` and a `message` in this
         * case.
         *
         *
         * Here's a sample Batch Response with 2 _successful_ and 1 _failed_ result:
         *
         *
         * ```json
         * {
         * "summary": {
         * "successfulRequests": 2,
         * "totalRequests": 3
         * },
         * "batchItems": [
         * {
         * "statusCode": 200,
         * "response":
         * {
         * "summary": {
         * "query": "one microsoft way redmond wa 98052"
         * },
         * "results": [
         * {
         * "position": {
         * "lat": 47.63989,
         * "lon": -122.12509
         * }
         * }
         * ]
         * }
         * },
         * {
         * "statusCode": 200,
         * "response":
         * {
         * "summary": {
         * "query": "pike pl seattle wa 98101"
         * },
         * "results": [
         * {
         * "position": {
         * "lat": 47.60963,
         * "lon": -122.34215
         * }
         * }
         * ]
         * }
         * },
         * {
         * "statusCode": 400,
         * "response":
         * {
         * "error":
         * {
         * "code": "400 BadRequest",
         * "message": "Bad request: one or more parameters were incorrectly specified or are mutually
         * exclusive."
         * }
         * }
         * }
         * ]
         * }
         * ```
         *
         *
         * ### Data Retention Period
         * Please, be aware that batch results are available for download for **14** days, after which the
         * request for results download will return `404 Not Found` response.
         * @param searchAddressBatchRequestBody The list of address geocoding queries/requests to process.
         * The list can contain  a max of 10,000 queries and must contain at least 1 query.
         * @param [options] The optional parameters
         * @returns Promise<msRestAzure.LROPoller>
         */
        Search.prototype.beginPostSearchAddressBatchPreview = function (searchAddressBatchRequestBody, options) {
            return this.client.sendLRORequest({
                searchAddressBatchRequestBody: searchAddressBatchRequestBody,
                options: options
            }, beginPostSearchAddressBatchPreviewOperationSpec, options);
        };
        /**
         * **Search Address Reverse Batch API**
         *
         *
         * **Applies to**: S1 pricing tier.
         *
         *
         *
         * The Search Address Reverse Batch API allows the caller to batch up to 10,000 [Search Address
         * Reverse API](https://docs.microsoft.com/en-us/rest/api/maps/search/getsearchaddressreverse)
         * queries/requests using just a single API call.
         * ### Submit Batch Request
         * To send the _search address reverse_ queries you will use a `POST` request where the request
         * body will contain the `batchItems` array in `json` format and the `Content-Type` header will be
         * set to `application/json`. Here's a sample request body containing 5 _search address reverse_
         * queries:
         *
         *
         * ```json
         * {
         * "batchItems": [
         * {"query": "?query=48.858561,2.294911"},
         * {"query": "?query=47.639765,-122.127896&radius=5000&limit=2"},
         * {"query": "?query=47.621028,-122.348170"},
         * {"query": "?query=43.722990,10.396695"},
         * {"query": "?query=40.750958,-73.982336"}
         * ]
         * }
         * ```
         *
         * A _search address reverse_ query in a batch is just a partial URL _without_ the protocol, base
         * URL, path, api-version and subscription-key. It can accept any of the supported _search address
         * reverse_ [URI
         * parameters](https://docs.microsoft.com/en-us/rest/api/maps/search/getsearchaddressreverse#uri-parameters).
         * The string values in the _search address reverse_ query must be properly escaped (e.g. "
         * character should be escaped with \\ ) and it should also be properly URL-encoded.
         *
         *
         * The maximum number of queries that can be specified in the batch is **10,000** and the batch
         * should contain at least **1** query.
         *
         *
         * Please note that the Search Address Reverse Batch API is a long-running request. Here's a
         * typical sequence of operations:
         * 1. Client sends a Search Address Reverse Batch `POST` request to Azure Maps
         * 2. The server will respond with one of the following:
         *
         * > HTTP `202 Accepted` - Batch request has been accepted.
         *
         * > HTTP `Error` - There was an error processing your Batch request. This could either be a `400
         * Bad Request` or any other `Error` status code.
         *
         * 3. If the batch request was accepted successfully, the `Location` header in the response
         * contains the URL to download the results of the batch request.
         * 4. Client issues a `GET` request on the _download URL_ obtained in Step 3 to download the batch
         * results.
         *
         *
         *
         * ### Download Batch Results
         * To download the batch results you will issue a `GET` request to the batch download endpoint.
         * This _download URL_ can be obtained from the `Location` header of a successful `POST` batch
         * request and looks like the following:
         *
         *
         * ```
         * https://atlas.microsoft.com/batch/{batch-id}?api-version=1.0&subscription-key={subscription-key}
         * ```
         *
         * Here's the typical sequence of operations for downloading the batch results:
         * 1. Client sends a `GET` request using the _download URL_.
         * 2. The server will respond with one of the following:
         *
         * > HTTP `202 Accepted` - Batch request was accepted but is still being processed. Please try
         * again in some time.
         *
         * > HTTP `200 OK` - Batch request successfully processed. The response body contains all the batch
         * results.
         *
         *
         *
         * ### Batch Response Model
         * When downloading the results of a batch request, if the batch has finished processing, the
         * response body contains the batch response. This batch response contains a `summary` component
         * that indicates the `totalRequests` that were part of the original batch request and
         * `successfulRequests` i.e. queries which were executed successfully. The batch response also
         * includes a `batchItems` array which contains a response for each and every query in the batch
         * request. Also, the `batchItems` will contain the results in the exact same order the original
         * queries were sent in the batch request. Each item in `batchItems` contains `statusCode` and
         * `response` fields. Each `response` in `batchItems` is of one of the following types:
         *
         * -
         * [`SearchAddressReverseResponse`](https://docs.microsoft.com/en-us/rest/api/maps/search/getsearchaddressreverse#searchaddressreverseresponse)
         * - If the query completed successfully.
         *
         * - `Error` - If the query failed. The result will contain a `status code` and a `message` in this
         * case.
         *
         *
         * Here's a sample Batch Response with 2 _successful_ and 1 _failed_ result:
         *
         *
         * ```json
         * {
         * "summary": {
         * "successfulRequests": 2,
         * "totalRequests": 3
         * },
         * "batchItems": [
         * {
         * "statusCode": 200,
         * "response":
         * {
         * "summary": {
         * "queryTime": 11
         * },
         * "addresses": [
         * {
         * "address": {
         * "country": "France",
         * "freeformAddress": "Avenue Anatole France, 75007 Paris"
         * },
         * "position": "48.858490,2.294820"
         * }
         * ]
         * }
         * },
         * {
         * "statusCode": 200,
         * "response":
         * {
         * "summary": {
         * "queryTime": 1
         * },
         * "addresses": [
         * {
         * "address": {
         * "country": "United States of America",
         * "freeformAddress": "157th Pl NE, Redmond WA 98052"
         * },
         * "position": "47.640470,-122.129430"
         * }
         * ]
         * }
         * },
         * {
         * "statusCode": 400,
         * "response":
         * {
         * "error":
         * {
         * "code": "400 BadRequest",
         * "message": "Bad request: one or more parameters were incorrectly specified or are mutually
         * exclusive."
         * }
         * }
         * }
         * ]
         * }
         * ```
         *
         *
         * ### Data Retention Period
         * Please, be aware that batch results are available for download for **14** days, after which the
         * request for results download will return `404 Not Found` response.
         * @param searchAddressReverseBatchRequestBody The list of reverse geocoding queries/requests to
         * process. The list can contain  a max of 10,000 queries and must contain at least 1 query.
         * @param [options] The optional parameters
         * @returns Promise<msRestAzure.LROPoller>
         */
        Search.prototype.beginPostSearchAddressReverseBatchPreview = function (searchAddressReverseBatchRequestBody, options) {
            return this.client.sendLRORequest({
                searchAddressReverseBatchRequestBody: searchAddressReverseBatchRequestBody,
                options: options
            }, beginPostSearchAddressReverseBatchPreviewOperationSpec, options);
        };
        return Search;
    }());
    // Operation Specifications
    var serializer$1 = new Serializer(Mappers);
    var getSearchPolygonOperationSpec = {
        httpMethod: "GET",
        path: "search/polygon/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion,
            geometries
        ],
        headerParameters: [
            acceptLanguage0
        ],
        responses: {
            200: {
                bodyMapper: SearchPolygonResponse
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$1
    };
    var getSearchFuzzyOperationSpec = {
        httpMethod: "GET",
        path: "search/fuzzy/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion,
            query0,
            typeahead,
            limit0,
            ofs0,
            countrySet,
            lat0,
            lon0,
            radius,
            topLeft,
            btmRight,
            language,
            extendedPostalCodesFor,
            minFuzzyLevel,
            maxFuzzyLevel,
            idxSet,
            brandSet,
            connectorSet,
            view,
            openingHours
        ],
        headerParameters: [
            acceptLanguage0
        ],
        responses: {
            200: {
                bodyMapper: SearchFuzzyResponse
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$1
    };
    var getSearchPOIOperationSpec = {
        httpMethod: "GET",
        path: "search/poi/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion,
            query0,
            typeahead,
            limit0,
            ofs0,
            countrySet,
            lat0,
            lon0,
            radius,
            topLeft,
            btmRight,
            language,
            extendedPostalCodesFor,
            brandSet,
            connectorSet,
            view,
            openingHours
        ],
        headerParameters: [
            acceptLanguage0
        ],
        responses: {
            200: {
                bodyMapper: SearchPoiResponse
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$1
    };
    var getSearchNearbyOperationSpec = {
        httpMethod: "GET",
        path: "search/nearby/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion,
            lat1,
            lon1,
            limit0,
            ofs0,
            countrySet,
            radius,
            language,
            extendedPostalCodesFor,
            brandSet,
            connectorSet,
            view
        ],
        headerParameters: [
            acceptLanguage0
        ],
        responses: {
            200: {
                bodyMapper: SearchNearbyResponse
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$1
    };
    var getSearchPOICategoryOperationSpec = {
        httpMethod: "GET",
        path: "search/poi/category/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion,
            query0,
            typeahead,
            limit0,
            countrySet,
            lat0,
            lon0,
            radius,
            topLeft,
            btmRight,
            language,
            extendedPostalCodesFor,
            brandSet,
            connectorSet,
            view,
            openingHours
        ],
        headerParameters: [
            acceptLanguage0
        ],
        responses: {
            200: {
                bodyMapper: SearchPoiCategoryResponse
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$1
    };
    var getSearchAddressOperationSpec = {
        httpMethod: "GET",
        path: "search/address/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion,
            query0,
            typeahead,
            limit0,
            ofs1,
            countrySet,
            lat0,
            lon0,
            radius,
            topLeft,
            btmRight,
            language,
            extendedPostalCodesFor,
            view
        ],
        headerParameters: [
            acceptLanguage0
        ],
        responses: {
            200: {
                bodyMapper: SearchAddressResponse
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$1
    };
    var getSearchAddressReverseOperationSpec = {
        httpMethod: "GET",
        path: "search/address/reverse/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion,
            query0,
            language,
            returnSpeedLimit,
            heading,
            radius,
            number,
            returnRoadUse,
            roadUse,
            allowFreeformNewline,
            returnMatchType,
            entityType,
            view
        ],
        headerParameters: [
            acceptLanguage0
        ],
        responses: {
            200: {
                bodyMapper: SearchAddressReverseResponse
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$1
    };
    var getSearchAddressReverseCrossStreetOperationSpec = {
        httpMethod: "GET",
        path: "search/address/reverse/crossStreet/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion,
            query0,
            heading,
            radius,
            language,
            view
        ],
        headerParameters: [
            acceptLanguage0
        ],
        responses: {
            200: {
                bodyMapper: SearchAddressReverseCrossStreetResponse
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$1
    };
    var getSearchAddressStructuredOperationSpec = {
        httpMethod: "GET",
        path: "search/address/structured/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion,
            language,
            countryCode,
            limit1,
            ofs2,
            streetNumber,
            streetName,
            crossStreet,
            municipality,
            municipalitySubdivision,
            countryTertiarySubdivision,
            countrySecondarySubdivision,
            countrySubdivision,
            postalCode,
            extendedPostalCodesFor,
            view
        ],
        headerParameters: [
            acceptLanguage0
        ],
        responses: {
            200: {
                bodyMapper: SearchAddressStructuredResponse
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$1
    };
    var postSearchInsideGeometryOperationSpec = {
        httpMethod: "POST",
        path: "search/geometry/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion,
            query0,
            limit0,
            language,
            extendedPostalCodesFor,
            idxSet,
            view,
            openingHours
        ],
        headerParameters: [
            acceptLanguage0
        ],
        requestBody: {
            parameterPath: "searchInsideGeometryRequestBody",
            mapper: __assign(__assign({}, SearchInsideGeometryRequestBody), { required: true })
        },
        responses: {
            200: {
                bodyMapper: SearchGeometryResponse
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$1
    };
    var postSearchAlongRouteOperationSpec = {
        httpMethod: "POST",
        path: "search/alongRoute/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion,
            query0,
            maxDetourTime,
            limit2,
            brandSet,
            connectorSet,
            view,
            openingHours
        ],
        headerParameters: [
            acceptLanguage0
        ],
        requestBody: {
            parameterPath: "searchAlongRouteRequestBody",
            mapper: __assign(__assign({}, SearchAlongRouteRequestBody), { required: true })
        },
        responses: {
            200: {
                bodyMapper: SearchAlongRouteResponse
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$1
    };
    var beginPostSearchFuzzyBatchPreviewOperationSpec = {
        httpMethod: "POST",
        path: "search/fuzzy/batch/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion
        ],
        headerParameters: [
            acceptLanguage0
        ],
        requestBody: {
            parameterPath: "searchFuzzyBatchRequestBody",
            mapper: __assign(__assign({}, BatchRequestBody), { required: true })
        },
        responses: {
            200: {
                bodyMapper: BatchResponse,
                headersMapper: SearchPostSearchFuzzyBatchPreviewHeaders
            },
            202: {
                headersMapper: SearchPostSearchFuzzyBatchPreviewHeaders
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$1
    };
    var beginPostSearchAddressBatchPreviewOperationSpec = {
        httpMethod: "POST",
        path: "search/address/batch/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion
        ],
        headerParameters: [
            acceptLanguage0
        ],
        requestBody: {
            parameterPath: "searchAddressBatchRequestBody",
            mapper: __assign(__assign({}, BatchRequestBody), { required: true })
        },
        responses: {
            200: {
                bodyMapper: BatchResponse,
                headersMapper: SearchPostSearchAddressBatchPreviewHeaders
            },
            202: {
                headersMapper: SearchPostSearchAddressBatchPreviewHeaders
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$1
    };
    var beginPostSearchAddressReverseBatchPreviewOperationSpec = {
        httpMethod: "POST",
        path: "search/address/reverse/batch/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion
        ],
        headerParameters: [
            acceptLanguage0
        ],
        requestBody: {
            parameterPath: "searchAddressReverseBatchRequestBody",
            mapper: __assign(__assign({}, BatchRequestBody), { required: true })
        },
        responses: {
            200: {
                bodyMapper: BatchResponse,
                headersMapper: SearchPostSearchAddressReverseBatchPreviewHeaders
            },
            202: {
                headersMapper: SearchPostSearchAddressReverseBatchPreviewHeaders
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$1
    };

    /*
     * Code generated by Microsoft (R) AutoRest Code Generator.
     * Changes may cause incorrect behavior and will be lost if the code is regenerated.
     */

    var Mappers$1 = /*#__PURE__*/Object.freeze({
        discriminators: discriminators,
        BatchRequestBody: BatchRequestBody,
        BatchRequestBodyBatchItemsItem: BatchRequestBodyBatchItemsItem,
        BatchResponse: BatchResponse,
        BatchResponseSummary: BatchResponseSummary,
        CloudError: CloudError,
        Coordinate: Coordinate,
        GeoJSONGeometry: GeoJSONGeometry,
        GeoJSONGeometryCollection: GeoJSONGeometryCollection,
        LineString: LineString,
        MultiLineString: MultiLineString,
        MultiPoint: MultiPoint,
        MultiPolygon: MultiPolygon,
        Point: Point,
        Polygon: Polygon,
        RouteDirectionsRequestBody: RouteDirectionsRequestBody,
        RouteDirectionsRequestBodySupportingPoints: RouteDirectionsRequestBodySupportingPoints,
        RouteDirectionsResponse: RouteDirectionsResponse,
        RouteDirectionsResult: RouteDirectionsResult,
        RouteDirectionsSummary: RouteDirectionsSummary,
        RouteMatrixRequestBody: RouteMatrixRequestBody,
        RouteMatrixResponse: RouteMatrixResponse,
        RouteMatrixResult: RouteMatrixResult,
        RouteMatrixResultResponse: RouteMatrixResultResponse,
        RouteMatrixSummary: RouteMatrixSummary,
        RouteOptimizedWaypoint: RouteOptimizedWaypoint,
        RoutePostRouteDirectionsBatchPreviewHeaders: RoutePostRouteDirectionsBatchPreviewHeaders,
        RoutePostRouteMatrixPreviewHeaders: RoutePostRouteMatrixPreviewHeaders,
        RouteRange: RouteRange,
        RouteRangeResponse: RouteRangeResponse,
        RouteResponseReport: RouteResponseReport,
        RouteResponseReportEffectiveSetting: RouteResponseReportEffectiveSetting,
        RouteResultGuidance: RouteResultGuidance,
        RouteResultInstruction: RouteResultInstruction,
        RouteResultInstructionGroup: RouteResultInstructionGroup,
        RouteResultLeg: RouteResultLeg,
        RouteResultLegSummary: RouteResultLegSummary,
        RouteResultSection: RouteResultSection,
        RouteResultSectionTec: RouteResultSectionTec,
        RouteResultSectionTecCause: RouteResultSectionTecCause
    });

    /*
     * Code generated by Microsoft (R) AutoRest Code Generator.
     * Changes may cause incorrect behavior and will be lost if the code is
     * regenerated.
     */
    /** Class representing a Route. */
    var Route = /** @class */ (function () {
        /**
         * Create a Route.
         * @param {MapsClientContext} client Reference to the service client.
         */
        function Route(client) {
            this.client = client;
        }
        /**
         *
         *
         * **Applies to**: S1 pricing tier.
         *
         * The Matrix Routing service allows calculation of a matrix of route summaries for a set of routes
         * defined by origin and destination locations. For every given origin, this service calculates the
         * cost of routing from that origin to every given destination. The set of origins and the set of
         * destinations can be thought of as the column and row headers of a table and each cell in the
         * table contains the costs of routing from the origin to the destination for that cell. For each
         * route, the travel times and distances are calculated. You can use the computed costs to
         * determine which routes to calculate using the Routing Directions API. If waitForResults
         * parameter in the request is set to false (default value), this API returns a 202 response code
         * along a redirect URL in the Location field of the response header. This URL should be checked
         * periodically until the response data or error information is available.
         *
         * The maximum size of a matrix for this API is 700 (the number of origins  multiplied by the
         * number of destinations). With that constraint in mind,  examples of possible matrix dimensions
         * are: 50x10, 10x10, 28x25. 10x70  (it does not need to be square).
         *
         * The asynchronous responses are stored for 14 days. The redirect URL returns a 404 response if
         * used after the expiration period.
         *
         * ### Download Async Results
         * When a request issues a `202 Accepted` response, the request is being processed using our async
         * pipeline. You will be given a URL to check the progress of your  async request in the location
         * header of the response.
         *
         * The URL provided by the location header will return the following responses when a `GET` request
         * is issued.
         *
         * > HTTP `202 Accepted` - Matrix request was accepted but is still being processed. Please try
         * again in some time.
         *
         * > HTTP `200 OK` - Matrix request successfully processed. The response body contains all of the
         * results.
         * @param routeMatrixBody The matrix of origin and destination coordinates to compute the route
         * distance, travel time and other summary for each cell of the matrix based on the input
         * parameters. The minimum and the maximum cell count supported are 1 and 700 respectively. For
         * example, it can be 35 origins and 20 destinations or 25 origins and 25 destinations.
         * @param [options] The optional parameters
         * @returns Promise<Models.RoutePostRouteMatrixPreviewResponse>
         */
        Route.prototype.postRouteMatrixPreview = function (routeMatrixBody, options) {
            return this.beginPostRouteMatrixPreview(routeMatrixBody, options)
                .then(function (lroPoller) { return lroPoller.pollUntilFinished(); });
        };
        Route.prototype.getRouteDirections = function (query, options, callback) {
            return this.client.sendOperationRequest({
                query: query,
                options: options
            }, getRouteDirectionsOperationSpec, callback);
        };
        Route.prototype.postRouteDirections = function (query, routeDirectionsRequestBody, options, callback) {
            return this.client.sendOperationRequest({
                query: query,
                routeDirectionsRequestBody: routeDirectionsRequestBody,
                options: options
            }, postRouteDirectionsOperationSpec, callback);
        };
        Route.prototype.getRouteRange = function (query, options, callback) {
            return this.client.sendOperationRequest({
                query: query,
                options: options
            }, getRouteRangeOperationSpec, callback);
        };
        /**
         * **Route Directions Batch API**
         *
         *
         * **Applies to**: S1 pricing tier.
         *
         *
         *
         * The Route Directions Batch API allows the caller to batch up to 700 [Route Directions
         * API](https://docs.microsoft.com/en-us/rest/api/maps/route/getroutedirections) queries/requests
         * using just a single API call.
         * ### Submit Batch Request
         * To send the _route directions_ queries you will use a `POST` request where the request body will
         * contain the `batchItems` array in `json` format and the `Content-Type` header will be set to
         * `application/json`. Here's a sample request body containing 3 _route directions_ queries:
         *
         *
         * ```json
         * {
         * "batchItems": [
         * { "query":
         * "?query=47.620659,-122.348934:47.610101,-122.342015&travelMode=bicycle&routeType=eco&traffic=false"
         * },
         * { "query":
         * "?query=40.759856,-73.985108:40.771136,-73.973506&travelMode=pedestrian&routeType=shortest" },
         * { "query": "?query=48.923159,-122.557362:32.621279,-116.840362" }
         * ]
         * }
         * ```
         *
         * A _route directions_ query in a batch is just a partial URL _without_ the protocol, base URL,
         * path, api-version and subscription-key. It can accept any of the supported _route directions_
         * [URI
         * parameters](https://docs.microsoft.com/en-us/rest/api/maps/route/getroutedirections#uri-parameters).
         * The string values in the _route directions_ query must be properly escaped (e.g. " character
         * should be escaped with \\ ) and it should also be properly URL-encoded.
         *
         *
         * The maximum number of queries that can be specified in the batch is **700** and the batch should
         * contain at least **1** query.
         *
         *
         * Please note that the Route Directions Batch API is a long-running request. Here's a typical
         * sequence of operations:
         * 1. Client sends a Route Directions Batch `POST` request to Azure Maps
         * 2. The server will respond with one of the following:
         *
         * > HTTP `202 Accepted` - Batch request has been accepted.
         *
         * > HTTP `Error` - There was an error processing your Batch request. This could either be a `400
         * Bad Request` or any other `Error` status code.
         *
         * 3. If the batch request was accepted successfully, the `Location` header in the response
         * contains the URL to download the results of the batch request.
         * 4. Client issues a `GET` request on the _download URL_ obtained in Step 3 to download the batch
         * results.
         *
         *
         *
         * ### Download Batch Results
         * To download the batch results you will issue a `GET` request to the batch download endpoint.
         * This _download URL_ can be obtained from the `Location` header of a successful `POST` batch
         * request and looks like the following:
         *
         *
         * ```
         * https://atlas.microsoft.com/batch/{batch-id}?api-version=1.0&subscription-key={subscription-key}
         * ```
         *
         * Here's the typical sequence of operations for downloading the batch results:
         * 1. Client sends a `GET` request using the _download URL_.
         * 2. The server will respond with one of the following:
         *
         * > HTTP `202 Accepted` - Batch request was accepted but is still being processed. Please try
         * again in some time.
         *
         * > HTTP `200 OK` - Batch request successfully processed. The response body contains all the batch
         * results.
         *
         *
         *
         * ### Batch Response Model
         * When downloading the results of a batch request, if the batch has finished processing, the
         * response body contains the batch response. This batch response contains a `summary` component
         * that indicates the `totalRequests` that were part of the original batch request and
         * `successfulRequests`i.e. queries which were executed successfully. The batch response also
         * includes a `batchItems` array which contains a response for each and every query in the batch
         * request. Also, the `batchItems` will contain the results in the exact same order the original
         * queries were sent in the batch request. Each item in `batchItems` contains `statusCode` and
         * `response` fields. Each `response` in `batchItems` is of one of the following types:
         *
         * -
         * [`RouteDirectionsResponse`](https://docs.microsoft.com/en-us/rest/api/maps/route/getroutedirections#routedirectionsresponse)
         * - If the query completed successfully.
         *
         * - `Error` - If the query failed. The response will contain a `code` and a `message` in this
         * case.
         *
         *
         * Here's a sample Batch Response with 1 _successful_ and 1 _failed_ result:
         *
         *
         * ```json
         * {
         * "summary": {
         * "successfulRequests": 1,
         * "totalRequests": 2
         * },
         * "batchItems": [
         * {
         * "statusCode": 200,
         * "response": {
         * "routes": [
         * {
         * "summary": {
         * "lengthInMeters": 1758,
         * "travelTimeInSeconds": 387,
         * "trafficDelayInSeconds": 0,
         * "departureTime": "2018-07-17T00:49:56+00:00",
         * "arrivalTime": "2018-07-17T00:56:22+00:00"
         * },
         * "legs": [
         * {
         * "summary": {
         * "lengthInMeters": 1758,
         * "travelTimeInSeconds": 387,
         * "trafficDelayInSeconds": 0,
         * "departureTime": "2018-07-17T00:49:56+00:00",
         * "arrivalTime": "2018-07-17T00:56:22+00:00"
         * },
         * "points": [
         * {
         * "latitude": 47.62094,
         * "longitude": -122.34892
         * },
         * {
         * "latitude": 47.62094,
         * "longitude": -122.3485
         * },
         * {
         * "latitude": 47.62095,
         * "longitude": -122.3476
         * }
         * ]
         * }
         * ],
         * "sections": [
         * {
         * "startPointIndex": 0,
         * "endPointIndex": 40,
         * "sectionType": "TRAVEL_MODE",
         * "travelMode": "bicycle"
         * }
         * ]
         * }
         * ]
         * }
         * },
         * {
         * "statusCode": 400,
         * "response":
         * {
         * "error":
         * {
         * "code": "400 BadRequest",
         * "message": "Bad request: one or more parameters were incorrectly specified or are mutually
         * exclusive."
         * }
         * }
         * }
         * ]
         * }
         * ```
         *
         *
         * ### Data Retention Period
         * Please, be aware that batch results are available for download for **14** days, after which the
         * request for results download will return `404 Not Found` response.
         * @param routeDirectionsBatchRequestBody The list of route directions queries/requests to process.
         * The list can contain  a max of 700 queries and must contain at least 1 query.
         * @param [options] The optional parameters
         * @returns Promise<Models.RoutePostRouteDirectionsBatchPreviewResponse>
         */
        Route.prototype.postRouteDirectionsBatchPreview = function (routeDirectionsBatchRequestBody, options) {
            return this.beginPostRouteDirectionsBatchPreview(routeDirectionsBatchRequestBody, options)
                .then(function (lroPoller) { return lroPoller.pollUntilFinished(); });
        };
        /**
         *
         *
         * **Applies to**: S1 pricing tier.
         *
         * The Matrix Routing service allows calculation of a matrix of route summaries for a set of routes
         * defined by origin and destination locations. For every given origin, this service calculates the
         * cost of routing from that origin to every given destination. The set of origins and the set of
         * destinations can be thought of as the column and row headers of a table and each cell in the
         * table contains the costs of routing from the origin to the destination for that cell. For each
         * route, the travel times and distances are calculated. You can use the computed costs to
         * determine which routes to calculate using the Routing Directions API. If waitForResults
         * parameter in the request is set to false (default value), this API returns a 202 response code
         * along a redirect URL in the Location field of the response header. This URL should be checked
         * periodically until the response data or error information is available.
         *
         * The maximum size of a matrix for this API is 700 (the number of origins  multiplied by the
         * number of destinations). With that constraint in mind,  examples of possible matrix dimensions
         * are: 50x10, 10x10, 28x25. 10x70  (it does not need to be square).
         *
         * The asynchronous responses are stored for 14 days. The redirect URL returns a 404 response if
         * used after the expiration period.
         *
         * ### Download Async Results
         * When a request issues a `202 Accepted` response, the request is being processed using our async
         * pipeline. You will be given a URL to check the progress of your  async request in the location
         * header of the response.
         *
         * The URL provided by the location header will return the following responses when a `GET` request
         * is issued.
         *
         * > HTTP `202 Accepted` - Matrix request was accepted but is still being processed. Please try
         * again in some time.
         *
         * > HTTP `200 OK` - Matrix request successfully processed. The response body contains all of the
         * results.
         * @param routeMatrixBody The matrix of origin and destination coordinates to compute the route
         * distance, travel time and other summary for each cell of the matrix based on the input
         * parameters. The minimum and the maximum cell count supported are 1 and 700 respectively. For
         * example, it can be 35 origins and 20 destinations or 25 origins and 25 destinations.
         * @param [options] The optional parameters
         * @returns Promise<msRestAzure.LROPoller>
         */
        Route.prototype.beginPostRouteMatrixPreview = function (routeMatrixBody, options) {
            return this.client.sendLRORequest({
                routeMatrixBody: routeMatrixBody,
                options: options
            }, beginPostRouteMatrixPreviewOperationSpec, options);
        };
        /**
         * **Route Directions Batch API**
         *
         *
         * **Applies to**: S1 pricing tier.
         *
         *
         *
         * The Route Directions Batch API allows the caller to batch up to 700 [Route Directions
         * API](https://docs.microsoft.com/en-us/rest/api/maps/route/getroutedirections) queries/requests
         * using just a single API call.
         * ### Submit Batch Request
         * To send the _route directions_ queries you will use a `POST` request where the request body will
         * contain the `batchItems` array in `json` format and the `Content-Type` header will be set to
         * `application/json`. Here's a sample request body containing 3 _route directions_ queries:
         *
         *
         * ```json
         * {
         * "batchItems": [
         * { "query":
         * "?query=47.620659,-122.348934:47.610101,-122.342015&travelMode=bicycle&routeType=eco&traffic=false"
         * },
         * { "query":
         * "?query=40.759856,-73.985108:40.771136,-73.973506&travelMode=pedestrian&routeType=shortest" },
         * { "query": "?query=48.923159,-122.557362:32.621279,-116.840362" }
         * ]
         * }
         * ```
         *
         * A _route directions_ query in a batch is just a partial URL _without_ the protocol, base URL,
         * path, api-version and subscription-key. It can accept any of the supported _route directions_
         * [URI
         * parameters](https://docs.microsoft.com/en-us/rest/api/maps/route/getroutedirections#uri-parameters).
         * The string values in the _route directions_ query must be properly escaped (e.g. " character
         * should be escaped with \\ ) and it should also be properly URL-encoded.
         *
         *
         * The maximum number of queries that can be specified in the batch is **700** and the batch should
         * contain at least **1** query.
         *
         *
         * Please note that the Route Directions Batch API is a long-running request. Here's a typical
         * sequence of operations:
         * 1. Client sends a Route Directions Batch `POST` request to Azure Maps
         * 2. The server will respond with one of the following:
         *
         * > HTTP `202 Accepted` - Batch request has been accepted.
         *
         * > HTTP `Error` - There was an error processing your Batch request. This could either be a `400
         * Bad Request` or any other `Error` status code.
         *
         * 3. If the batch request was accepted successfully, the `Location` header in the response
         * contains the URL to download the results of the batch request.
         * 4. Client issues a `GET` request on the _download URL_ obtained in Step 3 to download the batch
         * results.
         *
         *
         *
         * ### Download Batch Results
         * To download the batch results you will issue a `GET` request to the batch download endpoint.
         * This _download URL_ can be obtained from the `Location` header of a successful `POST` batch
         * request and looks like the following:
         *
         *
         * ```
         * https://atlas.microsoft.com/batch/{batch-id}?api-version=1.0&subscription-key={subscription-key}
         * ```
         *
         * Here's the typical sequence of operations for downloading the batch results:
         * 1. Client sends a `GET` request using the _download URL_.
         * 2. The server will respond with one of the following:
         *
         * > HTTP `202 Accepted` - Batch request was accepted but is still being processed. Please try
         * again in some time.
         *
         * > HTTP `200 OK` - Batch request successfully processed. The response body contains all the batch
         * results.
         *
         *
         *
         * ### Batch Response Model
         * When downloading the results of a batch request, if the batch has finished processing, the
         * response body contains the batch response. This batch response contains a `summary` component
         * that indicates the `totalRequests` that were part of the original batch request and
         * `successfulRequests`i.e. queries which were executed successfully. The batch response also
         * includes a `batchItems` array which contains a response for each and every query in the batch
         * request. Also, the `batchItems` will contain the results in the exact same order the original
         * queries were sent in the batch request. Each item in `batchItems` contains `statusCode` and
         * `response` fields. Each `response` in `batchItems` is of one of the following types:
         *
         * -
         * [`RouteDirectionsResponse`](https://docs.microsoft.com/en-us/rest/api/maps/route/getroutedirections#routedirectionsresponse)
         * - If the query completed successfully.
         *
         * - `Error` - If the query failed. The response will contain a `code` and a `message` in this
         * case.
         *
         *
         * Here's a sample Batch Response with 1 _successful_ and 1 _failed_ result:
         *
         *
         * ```json
         * {
         * "summary": {
         * "successfulRequests": 1,
         * "totalRequests": 2
         * },
         * "batchItems": [
         * {
         * "statusCode": 200,
         * "response": {
         * "routes": [
         * {
         * "summary": {
         * "lengthInMeters": 1758,
         * "travelTimeInSeconds": 387,
         * "trafficDelayInSeconds": 0,
         * "departureTime": "2018-07-17T00:49:56+00:00",
         * "arrivalTime": "2018-07-17T00:56:22+00:00"
         * },
         * "legs": [
         * {
         * "summary": {
         * "lengthInMeters": 1758,
         * "travelTimeInSeconds": 387,
         * "trafficDelayInSeconds": 0,
         * "departureTime": "2018-07-17T00:49:56+00:00",
         * "arrivalTime": "2018-07-17T00:56:22+00:00"
         * },
         * "points": [
         * {
         * "latitude": 47.62094,
         * "longitude": -122.34892
         * },
         * {
         * "latitude": 47.62094,
         * "longitude": -122.3485
         * },
         * {
         * "latitude": 47.62095,
         * "longitude": -122.3476
         * }
         * ]
         * }
         * ],
         * "sections": [
         * {
         * "startPointIndex": 0,
         * "endPointIndex": 40,
         * "sectionType": "TRAVEL_MODE",
         * "travelMode": "bicycle"
         * }
         * ]
         * }
         * ]
         * }
         * },
         * {
         * "statusCode": 400,
         * "response":
         * {
         * "error":
         * {
         * "code": "400 BadRequest",
         * "message": "Bad request: one or more parameters were incorrectly specified or are mutually
         * exclusive."
         * }
         * }
         * }
         * ]
         * }
         * ```
         *
         *
         * ### Data Retention Period
         * Please, be aware that batch results are available for download for **14** days, after which the
         * request for results download will return `404 Not Found` response.
         * @param routeDirectionsBatchRequestBody The list of route directions queries/requests to process.
         * The list can contain  a max of 700 queries and must contain at least 1 query.
         * @param [options] The optional parameters
         * @returns Promise<msRestAzure.LROPoller>
         */
        Route.prototype.beginPostRouteDirectionsBatchPreview = function (routeDirectionsBatchRequestBody, options) {
            return this.client.sendLRORequest({
                routeDirectionsBatchRequestBody: routeDirectionsBatchRequestBody,
                options: options
            }, beginPostRouteDirectionsBatchPreviewOperationSpec, options);
        };
        return Route;
    }());
    // Operation Specifications
    var serializer$2 = new Serializer(Mappers$1);
    var getRouteDirectionsOperationSpec = {
        httpMethod: "GET",
        path: "route/directions/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion,
            query0,
            maxAlternatives,
            alternativeType,
            minDeviationDistance,
            arriveAt,
            departAt,
            minDeviationTime,
            instructionsType,
            language,
            computeBestOrder,
            routeRepresentation,
            computeTravelTimeFor,
            vehicleHeading,
            report,
            sectionType,
            vehicleAxleWeight,
            vehicleWidth,
            vehicleHeight,
            vehicleLength,
            vehicleMaxSpeed,
            vehicleWeight,
            vehicleCommercial,
            windingness,
            hilliness,
            travelMode,
            avoid,
            traffic,
            routeType0,
            vehicleLoadType,
            vehicleEngineType,
            constantSpeedConsumptionInLitersPerHundredkm,
            currentFuelInLiters,
            auxiliaryPowerInLitersPerHour,
            fuelEnergyDensityInMJoulesPerLiter,
            accelerationEfficiency,
            decelerationEfficiency,
            uphillEfficiency,
            downhillEfficiency,
            constantSpeedConsumptionInkWhPerHundredkm,
            currentChargeInkWh,
            maxChargeInkWh,
            auxiliaryPowerInkW
        ],
        headerParameters: [
            acceptLanguage0
        ],
        responses: {
            200: {
                bodyMapper: RouteDirectionsResponse
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$2
    };
    var postRouteDirectionsOperationSpec = {
        httpMethod: "POST",
        path: "route/directions/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion,
            query0,
            maxAlternatives,
            alternativeType,
            minDeviationDistance,
            minDeviationTime,
            instructionsType,
            language,
            computeBestOrder,
            routeRepresentation,
            computeTravelTimeFor,
            vehicleHeading,
            report,
            sectionType,
            arriveAt,
            departAt,
            vehicleAxleWeight,
            vehicleLength,
            vehicleHeight,
            vehicleWidth,
            vehicleMaxSpeed,
            vehicleWeight,
            vehicleCommercial,
            windingness,
            hilliness,
            travelMode,
            avoid,
            traffic,
            routeType0,
            vehicleLoadType,
            vehicleEngineType,
            constantSpeedConsumptionInLitersPerHundredkm,
            currentFuelInLiters,
            auxiliaryPowerInLitersPerHour,
            fuelEnergyDensityInMJoulesPerLiter,
            accelerationEfficiency,
            decelerationEfficiency,
            uphillEfficiency,
            downhillEfficiency,
            constantSpeedConsumptionInkWhPerHundredkm,
            currentChargeInkWh,
            maxChargeInkWh,
            auxiliaryPowerInkW
        ],
        headerParameters: [
            acceptLanguage0
        ],
        requestBody: {
            parameterPath: "routeDirectionsRequestBody",
            mapper: __assign(__assign({}, RouteDirectionsRequestBody), { required: true })
        },
        responses: {
            200: {
                bodyMapper: RouteDirectionsResponse
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$2
    };
    var getRouteRangeOperationSpec = {
        httpMethod: "GET",
        path: "route/range/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion,
            query0,
            fuelBudgetInLiters,
            energyBudgetInkWh,
            timeBudgetInSec,
            departAt,
            routeType0,
            traffic,
            avoid,
            travelMode,
            hilliness,
            windingness,
            vehicleAxleWeight,
            vehicleWidth,
            vehicleHeight,
            vehicleLength,
            vehicleMaxSpeed,
            vehicleWeight,
            vehicleCommercial,
            vehicleLoadType,
            vehicleEngineType,
            constantSpeedConsumptionInLitersPerHundredkm,
            currentFuelInLiters,
            auxiliaryPowerInLitersPerHour,
            fuelEnergyDensityInMJoulesPerLiter,
            accelerationEfficiency,
            decelerationEfficiency,
            uphillEfficiency,
            downhillEfficiency,
            constantSpeedConsumptionInkWhPerHundredkm,
            currentChargeInkWh,
            maxChargeInkWh,
            auxiliaryPowerInkW
        ],
        headerParameters: [
            acceptLanguage0
        ],
        responses: {
            200: {
                bodyMapper: RouteRangeResponse
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$2
    };
    var beginPostRouteMatrixPreviewOperationSpec = {
        httpMethod: "POST",
        path: "route/matrix/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion,
            waitForResults,
            computeTravelTimeFor,
            sectionType,
            arriveAt,
            departAt,
            vehicleAxleWeight,
            vehicleLength,
            vehicleHeight,
            vehicleWidth,
            vehicleMaxSpeed,
            vehicleWeight,
            windingness,
            hilliness,
            travelMode,
            avoid,
            traffic,
            routeType0,
            vehicleLoadType
        ],
        headerParameters: [
            acceptLanguage0
        ],
        requestBody: {
            parameterPath: "routeMatrixBody",
            mapper: __assign(__assign({}, RouteMatrixRequestBody), { required: true })
        },
        responses: {
            200: {
                bodyMapper: RouteMatrixResponse,
                headersMapper: RoutePostRouteMatrixPreviewHeaders
            },
            202: {
                headersMapper: RoutePostRouteMatrixPreviewHeaders
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$2
    };
    var beginPostRouteDirectionsBatchPreviewOperationSpec = {
        httpMethod: "POST",
        path: "route/directions/batch/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion
        ],
        headerParameters: [
            acceptLanguage0
        ],
        requestBody: {
            parameterPath: "routeDirectionsBatchRequestBody",
            mapper: __assign(__assign({}, BatchRequestBody), { required: true })
        },
        responses: {
            200: {
                bodyMapper: BatchResponse,
                headersMapper: RoutePostRouteDirectionsBatchPreviewHeaders
            },
            202: {
                headersMapper: RoutePostRouteDirectionsBatchPreviewHeaders
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$2
    };

    /*
     * Code generated by Microsoft (R) AutoRest Code Generator.
     * Changes may cause incorrect behavior and will be lost if the code is regenerated.
     */

    var Mappers$2 = /*#__PURE__*/Object.freeze({
        discriminators: discriminators,
        CloudError: CloudError,
        Country: Country,
        IanaId: IanaId,
        Names: Names,
        ReferenceTimeByCoordinates: ReferenceTimeByCoordinates,
        ReferenceTimeById: ReferenceTimeById,
        RepresentativePoint: RepresentativePoint,
        TimeTransition: TimeTransition,
        TimeZoneByCoordinates: TimeZoneByCoordinates,
        TimezoneByCoordinatesResult: TimezoneByCoordinatesResult,
        TimezoneById: TimezoneById,
        TimezoneByIdResult: TimezoneByIdResult,
        TimezoneEnumWindow: TimezoneEnumWindow,
        TimezoneIanaVersionResult: TimezoneIanaVersionResult
    });

    /*
     * Code generated by Microsoft (R) AutoRest Code Generator.
     * Changes may cause incorrect behavior and will be lost if the code is
     * regenerated.
     */
    /** Class representing a Timezone. */
    var Timezone = /** @class */ (function () {
        /**
         * Create a Timezone.
         * @param {MapsClientContext} client Reference to the service client.
         */
        function Timezone(client) {
            this.client = client;
        }
        Timezone.prototype.getTimezoneByID = function (query, options, callback) {
            return this.client.sendOperationRequest({
                query: query,
                options: options
            }, getTimezoneByIDOperationSpec, callback);
        };
        Timezone.prototype.getTimezoneByCoordinates = function (query, options, callback) {
            return this.client.sendOperationRequest({
                query: query,
                options: options
            }, getTimezoneByCoordinatesOperationSpec, callback);
        };
        Timezone.prototype.getTimezoneEnumWindows = function (options, callback) {
            return this.client.sendOperationRequest({
                options: options
            }, getTimezoneEnumWindowsOperationSpec, callback);
        };
        Timezone.prototype.getTimezoneEnumIANA = function (options, callback) {
            return this.client.sendOperationRequest({
                options: options
            }, getTimezoneEnumIANAOperationSpec, callback);
        };
        Timezone.prototype.getTimezoneIANAVersion = function (options, callback) {
            return this.client.sendOperationRequest({
                options: options
            }, getTimezoneIANAVersionOperationSpec, callback);
        };
        Timezone.prototype.getTimezoneWindowsToIANA = function (query, options, callback) {
            return this.client.sendOperationRequest({
                query: query,
                options: options
            }, getTimezoneWindowsToIANAOperationSpec, callback);
        };
        return Timezone;
    }());
    // Operation Specifications
    var serializer$3 = new Serializer(Mappers$2);
    var getTimezoneByIDOperationSpec = {
        httpMethod: "GET",
        path: "timezone/byId/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion,
            options,
            timeStamp,
            transitionsFrom,
            transitionsYears,
            query0
        ],
        headerParameters: [
            acceptLanguage1
        ],
        responses: {
            200: {
                bodyMapper: TimezoneByIdResult
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$3
    };
    var getTimezoneByCoordinatesOperationSpec = {
        httpMethod: "GET",
        path: "timezone/byCoordinates/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion,
            options,
            timeStamp,
            transitionsFrom,
            transitionsYears,
            query0
        ],
        headerParameters: [
            acceptLanguage1
        ],
        responses: {
            200: {
                bodyMapper: TimezoneByCoordinatesResult
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$3
    };
    var getTimezoneEnumWindowsOperationSpec = {
        httpMethod: "GET",
        path: "timezone/enumWindows/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion
        ],
        headerParameters: [
            acceptLanguage0
        ],
        responses: {
            200: {
                bodyMapper: {
                    serializedName: "parsedResponse",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "TimezoneEnumWindow"
                            }
                        }
                    }
                }
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$3
    };
    var getTimezoneEnumIANAOperationSpec = {
        httpMethod: "GET",
        path: "timezone/enumIana/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion
        ],
        headerParameters: [
            acceptLanguage0
        ],
        responses: {
            200: {
                bodyMapper: {
                    serializedName: "parsedResponse",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "IanaId"
                            }
                        }
                    }
                }
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$3
    };
    var getTimezoneIANAVersionOperationSpec = {
        httpMethod: "GET",
        path: "timezone/ianaVersion/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion
        ],
        headerParameters: [
            acceptLanguage0
        ],
        responses: {
            200: {
                bodyMapper: TimezoneIanaVersionResult
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$3
    };
    var getTimezoneWindowsToIANAOperationSpec = {
        httpMethod: "GET",
        path: "timezone/windowsToIana/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion,
            query0,
            territory
        ],
        headerParameters: [
            acceptLanguage0
        ],
        responses: {
            200: {
                bodyMapper: {
                    serializedName: "parsedResponse",
                    type: {
                        name: "Sequence",
                        element: {
                            type: {
                                name: "Composite",
                                className: "IanaId"
                            }
                        }
                    }
                }
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$3
    };

    /*
     * Code generated by Microsoft (R) AutoRest Code Generator.
     * Changes may cause incorrect behavior and will be lost if the code is regenerated.
     */

    var Mappers$3 = /*#__PURE__*/Object.freeze({
        discriminators: discriminators,
        CloudError: CloudError,
        CopyrightBoundingResult: CopyrightBoundingResult,
        CopyrightCaptionResult: CopyrightCaptionResult,
        CopyrightTileResult: CopyrightTileResult,
        CopyrightWorldResult: CopyrightWorldResult,
        Region: Region,
        RegionCountry: RegionCountry
    });

    /*
     * Code generated by Microsoft (R) AutoRest Code Generator.
     * Changes may cause incorrect behavior and will be lost if the code is
     * regenerated.
     */
    /** Class representing a Render. */
    var Render = /** @class */ (function () {
        /**
         * Create a Render.
         * @param {MapsClientContext} client Reference to the service client.
         */
        function Render(client) {
            this.client = client;
        }
        Render.prototype.getMapImage = function (options, callback) {
            return this.client.sendOperationRequest({
                options: options
            }, getMapImageOperationSpec, callback);
        };
        Render.prototype.getMapTile = function (format, layer, style, zoom, xTileIndex, yTileIndex, options, callback) {
            return this.client.sendOperationRequest({
                format: format,
                layer: layer,
                style: style,
                zoom: zoom,
                xTileIndex: xTileIndex,
                yTileIndex: yTileIndex,
                options: options
            }, getMapTileOperationSpec, callback);
        };
        Render.prototype.getCopyrightCaption = function (options, callback) {
            return this.client.sendOperationRequest({
                options: options
            }, getCopyrightCaptionOperationSpec, callback);
        };
        Render.prototype.getMapImageryTile = function (zoom, xTileIndex, yTileIndex, options, callback) {
            return this.client.sendOperationRequest({
                zoom: zoom,
                xTileIndex: xTileIndex,
                yTileIndex: yTileIndex,
                options: options
            }, getMapImageryTileOperationSpec, callback);
        };
        Render.prototype.getCopyrightFromBoundingBox = function (mincoordinates, maxcoordinates, options, callback) {
            return this.client.sendOperationRequest({
                mincoordinates: mincoordinates,
                maxcoordinates: maxcoordinates,
                options: options
            }, getCopyrightFromBoundingBoxOperationSpec, callback);
        };
        Render.prototype.getCopyrightForTile = function (zoom, xTileIndex, yTileIndex, options, callback) {
            return this.client.sendOperationRequest({
                zoom: zoom,
                xTileIndex: xTileIndex,
                yTileIndex: yTileIndex,
                options: options
            }, getCopyrightForTileOperationSpec, callback);
        };
        Render.prototype.getCopyrightForWorld = function (options, callback) {
            return this.client.sendOperationRequest({
                options: options
            }, getCopyrightForWorldOperationSpec, callback);
        };
        return Render;
    }());
    // Operation Specifications
    var serializer$4 = new Serializer(Mappers$3);
    var getMapImageOperationSpec = {
        httpMethod: "GET",
        path: "map/static/{format}",
        urlParameters: [
            format1
        ],
        queryParameters: [
            apiVersion,
            pins,
            path,
            layer0,
            style0,
            zoom0,
            center,
            bbox,
            height,
            width,
            language,
            view
        ],
        headerParameters: [
            acceptLanguage0
        ],
        responses: {
            200: {
                bodyMapper: {
                    serializedName: "parsedResponse",
                    type: {
                        name: "Stream"
                    }
                }
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$4
    };
    var getMapTileOperationSpec = {
        httpMethod: "GET",
        path: "map/tile/{format}",
        urlParameters: [
            format2
        ],
        queryParameters: [
            apiVersion,
            layer1,
            style1,
            zoom1,
            xTileIndex,
            yTileIndex,
            tileSize,
            language,
            view
        ],
        headerParameters: [
            acceptLanguage0
        ],
        responses: {
            200: {
                bodyMapper: {
                    serializedName: "parsedResponse",
                    type: {
                        name: "Stream"
                    }
                }
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$4
    };
    var getCopyrightCaptionOperationSpec = {
        httpMethod: "GET",
        path: "map/copyright/caption/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion
        ],
        headerParameters: [
            acceptLanguage0
        ],
        responses: {
            200: {
                bodyMapper: CopyrightCaptionResult
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$4
    };
    var getMapImageryTileOperationSpec = {
        httpMethod: "GET",
        path: "map/imagery/{format}",
        urlParameters: [
            format1
        ],
        queryParameters: [
            apiVersion,
            style2,
            zoom1,
            xTileIndex,
            yTileIndex
        ],
        headerParameters: [
            acceptLanguage0
        ],
        responses: {
            200: {
                bodyMapper: {
                    serializedName: "parsedResponse",
                    type: {
                        name: "Stream"
                    }
                }
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$4
    };
    var getCopyrightFromBoundingBoxOperationSpec = {
        httpMethod: "GET",
        path: "map/copyright/bounding/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion,
            mincoordinates,
            maxcoordinates,
            text
        ],
        headerParameters: [
            acceptLanguage0
        ],
        responses: {
            200: {
                bodyMapper: CopyrightBoundingResult
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$4
    };
    var getCopyrightForTileOperationSpec = {
        httpMethod: "GET",
        path: "map/copyright/tile/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion,
            zoom1,
            xTileIndex,
            yTileIndex,
            text
        ],
        headerParameters: [
            acceptLanguage0
        ],
        responses: {
            200: {
                bodyMapper: CopyrightTileResult
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$4
    };
    var getCopyrightForWorldOperationSpec = {
        httpMethod: "GET",
        path: "map/copyright/world/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion,
            text
        ],
        headerParameters: [
            acceptLanguage0
        ],
        responses: {
            200: {
                bodyMapper: CopyrightWorldResult
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$4
    };

    /*
     * Code generated by Microsoft (R) AutoRest Code Generator.
     * Changes may cause incorrect behavior and will be lost if the code is regenerated.
     */

    var Mappers$4 = /*#__PURE__*/Object.freeze({
        discriminators: discriminators,
        Agency: Agency,
        Alert: Alert,
        AlertDescription: AlertDescription,
        AlertDetail: AlertDetail,
        CarShareResponse: CarShareResponse,
        CloudError: CloudError,
        Coordinate: Coordinate,
        Direction: Direction,
        GeoJSONGeometry: GeoJSONGeometry,
        ItineraryResult: ItineraryResult,
        Leg: Leg,
        LegPoint: LegPoint,
        Line: Line,
        LineArrival: LineArrival,
        LineGroup: LineGroup,
        LineString: LineString,
        MetroAreaInfoResponse: MetroAreaInfoResponse,
        MetroAreaResponse: MetroAreaResponse,
        MetroAreaResult: MetroAreaResult,
        MultiLineString: MultiLineString,
        MultiPoint: MultiPoint,
        MultiPolygon: MultiPolygon,
        NearbyTransitResponse: NearbyTransitResponse,
        OperatorInfo: OperatorInfo,
        Pattern: Pattern,
        Point: Point,
        Polygon: Polygon,
        Pricing: Pricing,
        RealTimeArrivalResult: RealTimeArrivalResult,
        RealTimeArrivalsResponse: RealTimeArrivalsResponse,
        ResultViewport: ResultViewport,
        RouteItineraryLeg: RouteItineraryLeg,
        Step: Step,
        Stop: Stop,
        TransitDockInfoResponse: TransitDockInfoResponse,
        TransitItineraryResponse: TransitItineraryResponse,
        TransitLineInfoResponse: TransitLineInfoResponse,
        TransitObjectResult: TransitObjectResult,
        TransitRouteResponse: TransitRouteResponse,
        TransitStopInfoResponse: TransitStopInfoResponse,
        TransitTypeResult: TransitTypeResult
    });

    /*
     * Code generated by Microsoft (R) AutoRest Code Generator.
     * Changes may cause incorrect behavior and will be lost if the code is
     * regenerated.
     */
    /** Class representing a Mobility. */
    var Mobility = /** @class */ (function () {
        /**
         * Create a Mobility.
         * @param {MapsClientContext} client Reference to the service client.
         */
        function Mobility(client) {
            this.client = client;
        }
        Mobility.prototype.getMetroAreaPreview = function (query, options, callback) {
            return this.client.sendOperationRequest({
                query: query,
                options: options
            }, getMetroAreaPreviewOperationSpec, callback);
        };
        Mobility.prototype.getMetroAreaInfoPreview = function (query, detailType, options, callback) {
            return this.client.sendOperationRequest({
                query: query,
                detailType: detailType,
                options: options
            }, getMetroAreaInfoPreviewOperationSpec, callback);
        };
        Mobility.prototype.getNearbyTransitPreview = function (metroId, query, options, callback) {
            return this.client.sendOperationRequest({
                metroId: metroId,
                query: query,
                options: options
            }, getNearbyTransitPreviewOperationSpec, callback);
        };
        Mobility.prototype.getTransitDockInfoPreview = function (query, options, callback) {
            return this.client.sendOperationRequest({
                query: query,
                options: options
            }, getTransitDockInfoPreviewOperationSpec, callback);
        };
        Mobility.prototype.getCarShareInfoPreview = function (query, options, callback) {
            return this.client.sendOperationRequest({
                query: query,
                options: options
            }, getCarShareInfoPreviewOperationSpec, callback);
        };
        Mobility.prototype.getTransitLineInfoPreview = function (metroId, query, options, callback) {
            return this.client.sendOperationRequest({
                metroId: metroId,
                query: query,
                options: options
            }, getTransitLineInfoPreviewOperationSpec, callback);
        };
        Mobility.prototype.getTransitStopInfoPreview = function (metroId, query, options, callback) {
            return this.client.sendOperationRequest({
                metroId: metroId,
                query: query,
                options: options
            }, getTransitStopInfoPreviewOperationSpec, callback);
        };
        Mobility.prototype.getTransitRoutePreview = function (metroId, origin, destination, options, callback) {
            return this.client.sendOperationRequest({
                metroId: metroId,
                origin: origin,
                destination: destination,
                options: options
            }, getTransitRoutePreviewOperationSpec, callback);
        };
        Mobility.prototype.getTransitItineraryPreview = function (query, options, callback) {
            return this.client.sendOperationRequest({
                query: query,
                options: options
            }, getTransitItineraryPreviewOperationSpec, callback);
        };
        Mobility.prototype.getRealTimeArrivalsPreview = function (metroId, query, options, callback) {
            return this.client.sendOperationRequest({
                metroId: metroId,
                query: query,
                options: options
            }, getRealTimeArrivalsPreviewOperationSpec, callback);
        };
        return Mobility;
    }());
    // Operation Specifications
    var serializer$5 = new Serializer(Mappers$4);
    var getMetroAreaPreviewOperationSpec = {
        httpMethod: "GET",
        path: "mobility/metroArea/id/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion,
            query0,
            queryType0,
            language
        ],
        headerParameters: [
            acceptLanguage0
        ],
        responses: {
            200: {
                bodyMapper: MetroAreaResponse
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$5
    };
    var getMetroAreaInfoPreviewOperationSpec = {
        httpMethod: "GET",
        path: "mobility/metroArea/info/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion,
            query1,
            detailType0,
            language
        ],
        headerParameters: [
            acceptLanguage0
        ],
        responses: {
            200: {
                bodyMapper: MetroAreaInfoResponse
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$5
    };
    var getNearbyTransitPreviewOperationSpec = {
        httpMethod: "GET",
        path: "mobility/transit/nearby/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion,
            metroId,
            query0,
            limit1,
            radius,
            objectType,
            language
        ],
        headerParameters: [
            acceptLanguage0
        ],
        responses: {
            200: {
                bodyMapper: NearbyTransitResponse
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$5
    };
    var getTransitDockInfoPreviewOperationSpec = {
        httpMethod: "GET",
        path: "mobility/transit/dock/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion,
            query0,
            language
        ],
        headerParameters: [
            acceptLanguage0
        ],
        responses: {
            200: {
                bodyMapper: TransitDockInfoResponse
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$5
    };
    var getCarShareInfoPreviewOperationSpec = {
        httpMethod: "GET",
        path: "mobility/transit/carShare/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion,
            query0,
            language
        ],
        headerParameters: [
            acceptLanguage0
        ],
        responses: {
            200: {
                bodyMapper: CarShareResponse
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$5
    };
    var getTransitLineInfoPreviewOperationSpec = {
        httpMethod: "GET",
        path: "mobility/transit/line/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion,
            metroId,
            query0,
            detailType1,
            language
        ],
        headerParameters: [
            acceptLanguage0
        ],
        responses: {
            200: {
                bodyMapper: TransitLineInfoResponse
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$5
    };
    var getTransitStopInfoPreviewOperationSpec = {
        httpMethod: "GET",
        path: "mobility/transit/stop/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion,
            metroId,
            query0,
            queryType1,
            detailType2,
            language
        ],
        headerParameters: [
            acceptLanguage0
        ],
        responses: {
            200: {
                bodyMapper: TransitStopInfoResponse
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$5
    };
    var getTransitRoutePreviewOperationSpec = {
        httpMethod: "GET",
        path: "mobility/transit/route/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion,
            metroId,
            origin,
            originType,
            destination,
            destinationType,
            modeType,
            transitType,
            agency,
            agencyType,
            time,
            timeType,
            routeType1,
            bikeType,
            language
        ],
        headerParameters: [
            acceptLanguage0
        ],
        responses: {
            200: {
                bodyMapper: TransitRouteResponse
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$5
    };
    var getTransitItineraryPreviewOperationSpec = {
        httpMethod: "GET",
        path: "mobility/transit/itinerary/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion,
            query0,
            detailType3,
            language
        ],
        headerParameters: [
            acceptLanguage0
        ],
        responses: {
            200: {
                bodyMapper: TransitItineraryResponse
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$5
    };
    var getRealTimeArrivalsPreviewOperationSpec = {
        httpMethod: "GET",
        path: "mobility/realtime/arrivals/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion,
            metroId,
            query0,
            queryType2,
            stopQueryType,
            limit1,
            maxMinutesInFuture,
            transitType,
            agency,
            agencyType,
            timeoutInSeconds,
            language
        ],
        headerParameters: [
            acceptLanguage0
        ],
        responses: {
            200: {
                bodyMapper: RealTimeArrivalsResponse
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$5
    };

    /*
     * Code generated by Microsoft (R) AutoRest Code Generator.
     * Changes may cause incorrect behavior and will be lost if the code is regenerated.
     */

    var Mappers$5 = /*#__PURE__*/Object.freeze({
        discriminators: discriminators,
        BufferRequestBody: BufferRequestBody,
        BufferResponse: BufferResponse,
        BufferResponseSummary: BufferResponseSummary,
        ClosestPointResultEntry: ClosestPointResultEntry,
        CloudError: CloudError,
        GeofenceGeometry: GeofenceGeometry,
        GeofenceResponse: GeofenceResponse,
        GeoJSONFeatureCollection: GeoJSONFeatureCollection,
        GeoJSONFeatureCollectionFeaturesItem: GeoJSONFeatureCollectionFeaturesItem,
        GeoJSONGeometry: GeoJSONGeometry,
        GetClosestPointResponse: GetClosestPointResponse,
        GetClosestPointSummary: GetClosestPointSummary,
        GetPointInPolygonResponse: GetPointInPolygonResponse,
        GetPointInPolygonSummary: GetPointInPolygonSummary,
        GreatCircleDistanceResponse: GreatCircleDistanceResponse,
        GreatCircleDistanceResponseResult: GreatCircleDistanceResponseResult,
        GreatCircleDistanceResponseSummary: GreatCircleDistanceResponseSummary,
        LineString: LineString,
        MultiLineString: MultiLineString,
        MultiPoint: MultiPoint,
        MultiPolygon: MultiPolygon,
        Point: Point,
        PointInPolygonResult: PointInPolygonResult,
        Polygon: Polygon,
        PostClosestPointResponse: PostClosestPointResponse,
        PostClosestPointSummary: PostClosestPointSummary,
        PostPointInPolygonResponse: PostPointInPolygonResponse,
        PostPointInPolygonSummary: PostPointInPolygonSummary,
        SpatialCoordinate: SpatialCoordinate,
        SpatialGetGeofenceHeaders: SpatialGetGeofenceHeaders,
        SpatialPostGeofenceHeaders: SpatialPostGeofenceHeaders
    });

    /*
     * Code generated by Microsoft (R) AutoRest Code Generator.
     * Changes may cause incorrect behavior and will be lost if the code is
     * regenerated.
     */
    /** Class representing a Spatial. */
    var Spatial = /** @class */ (function () {
        /**
         * Create a Spatial.
         * @param {MapsClientContext} client Reference to the service client.
         */
        function Spatial(client) {
            this.client = client;
        }
        Spatial.prototype.getGeofence = function (deviceId, udId, lat, lon, options, callback) {
            return this.client.sendOperationRequest({
                deviceId: deviceId,
                udId: udId,
                lat: lat,
                lon: lon,
                options: options
            }, getGeofenceOperationSpec, callback);
        };
        Spatial.prototype.postGeofence = function (deviceId, lat, lon, searchGeofenceRequestBody, options, callback) {
            return this.client.sendOperationRequest({
                deviceId: deviceId,
                lat: lat,
                lon: lon,
                searchGeofenceRequestBody: searchGeofenceRequestBody,
                options: options
            }, postGeofenceOperationSpec, callback);
        };
        Spatial.prototype.postBuffer = function (bufferRequestBody, options, callback) {
            return this.client.sendOperationRequest({
                bufferRequestBody: bufferRequestBody,
                options: options
            }, postBufferOperationSpec, callback);
        };
        Spatial.prototype.getBuffer = function (udid, distances, options, callback) {
            return this.client.sendOperationRequest({
                udid: udid,
                distances: distances,
                options: options
            }, getBufferOperationSpec, callback);
        };
        Spatial.prototype.postClosestPoint = function (lat, lon, closestPointRequestBody, options, callback) {
            return this.client.sendOperationRequest({
                lat: lat,
                lon: lon,
                closestPointRequestBody: closestPointRequestBody,
                options: options
            }, postClosestPointOperationSpec, callback);
        };
        Spatial.prototype.getClosestPoint = function (udid, lat, lon, options, callback) {
            return this.client.sendOperationRequest({
                udid: udid,
                lat: lat,
                lon: lon,
                options: options
            }, getClosestPointOperationSpec, callback);
        };
        Spatial.prototype.postPointInPolygon = function (lat, lon, pointInPolygonRequestBody, options, callback) {
            return this.client.sendOperationRequest({
                lat: lat,
                lon: lon,
                pointInPolygonRequestBody: pointInPolygonRequestBody,
                options: options
            }, postPointInPolygonOperationSpec, callback);
        };
        Spatial.prototype.getPointInPolygon = function (udid, lat, lon, options, callback) {
            return this.client.sendOperationRequest({
                udid: udid,
                lat: lat,
                lon: lon,
                options: options
            }, getPointInPolygonOperationSpec, callback);
        };
        Spatial.prototype.getGreatCircleDistance = function (query, options, callback) {
            return this.client.sendOperationRequest({
                query: query,
                options: options
            }, getGreatCircleDistanceOperationSpec, callback);
        };
        return Spatial;
    }());
    // Operation Specifications
    var serializer$6 = new Serializer(Mappers$5);
    var getGeofenceOperationSpec = {
        httpMethod: "GET",
        path: "spatial/geofence/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion,
            deviceId,
            udId,
            lat1,
            lon1,
            userTime,
            searchBuffer,
            isAsync,
            mode
        ],
        headerParameters: [
            acceptLanguage0
        ],
        responses: {
            200: {
                bodyMapper: GeofenceResponse,
                headersMapper: SpatialGetGeofenceHeaders
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$6
    };
    var postGeofenceOperationSpec = {
        httpMethod: "POST",
        path: "spatial/geofence/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion,
            deviceId,
            lat1,
            lon1,
            userTime,
            searchBuffer,
            isAsync,
            mode
        ],
        headerParameters: [
            acceptLanguage0
        ],
        requestBody: {
            parameterPath: "searchGeofenceRequestBody",
            mapper: __assign(__assign({}, GeoJSONFeatureCollection), { required: true })
        },
        responses: {
            200: {
                bodyMapper: GeofenceResponse,
                headersMapper: SpatialPostGeofenceHeaders
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$6
    };
    var postBufferOperationSpec = {
        httpMethod: "POST",
        path: "spatial/buffer/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion
        ],
        headerParameters: [
            acceptLanguage0
        ],
        requestBody: {
            parameterPath: "bufferRequestBody",
            mapper: __assign(__assign({}, BufferRequestBody), { required: true })
        },
        responses: {
            200: {
                bodyMapper: BufferResponse
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$6
    };
    var getBufferOperationSpec = {
        httpMethod: "GET",
        path: "spatial/buffer/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion,
            udid,
            distances
        ],
        headerParameters: [
            acceptLanguage0
        ],
        responses: {
            200: {
                bodyMapper: BufferResponse
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$6
    };
    var postClosestPointOperationSpec = {
        httpMethod: "POST",
        path: "spatial/closestPoint/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion,
            lat1,
            lon1,
            numberOfClosestPoints
        ],
        headerParameters: [
            acceptLanguage0
        ],
        requestBody: {
            parameterPath: "closestPointRequestBody",
            mapper: __assign(__assign({}, GeoJSONFeatureCollection), { required: true })
        },
        responses: {
            200: {
                bodyMapper: PostClosestPointResponse
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$6
    };
    var getClosestPointOperationSpec = {
        httpMethod: "GET",
        path: "spatial/closestPoint/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion,
            udid,
            lat1,
            lon1,
            numberOfClosestPoints
        ],
        headerParameters: [
            acceptLanguage0
        ],
        responses: {
            200: {
                bodyMapper: GetClosestPointResponse
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$6
    };
    var postPointInPolygonOperationSpec = {
        httpMethod: "POST",
        path: "spatial/pointInPolygon/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion,
            lat1,
            lon1
        ],
        headerParameters: [
            acceptLanguage0
        ],
        requestBody: {
            parameterPath: "pointInPolygonRequestBody",
            mapper: __assign(__assign({}, GeoJSONFeatureCollection), { required: true })
        },
        responses: {
            200: {
                bodyMapper: PostPointInPolygonResponse
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$6
    };
    var getPointInPolygonOperationSpec = {
        httpMethod: "GET",
        path: "spatial/pointInPolygon/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion,
            udid,
            lat1,
            lon1
        ],
        headerParameters: [
            acceptLanguage0
        ],
        responses: {
            200: {
                bodyMapper: GetPointInPolygonResponse
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$6
    };
    var getGreatCircleDistanceOperationSpec = {
        httpMethod: "GET",
        path: "spatial/greatCircleDistance/{format}",
        urlParameters: [
            format0
        ],
        queryParameters: [
            apiVersion,
            query0
        ],
        headerParameters: [
            acceptLanguage0
        ],
        responses: {
            200: {
                bodyMapper: GreatCircleDistanceResponse
            },
            default: {
                bodyMapper: CloudError
            }
        },
        serializer: serializer$6
    };

    var version = "2.0.5";

    /**
     * AgentPolicy is a policy used to add agent headers to HTTP requests.
     *
     * @export
     * @class AgentPolicy
     * @extends {BaseRequestPolicy}
     */
    var AgentPolicy = /** @class */ (function (_super) {
        __extends(AgentPolicy, _super);
        /**
         * Creates an instance of AgentPolicy.
         * @param {RequestPolicy} nextPolicy
         * @param {RequestPolicyOptions} options
         * @memberof AgentPolicy
         */
        function AgentPolicy(nextPolicy, options) {
            return _super.call(this, nextPolicy, options) || this;
        }
        /**
         * Sends out request.
         *
         * @param {WebResource} request
         * @returns {Promise<HttpOperationResponse>}
         * @memberof AgentPolicy
         */
        AgentPolicy.prototype.sendRequest = function (request) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (!request.headers) {
                        request.headers = new HttpHeaders();
                    }
                    request.headers.set(HeaderConstants.MS_AM_REQUEST_ORIGIN, HeaderConstants.SERVICE_MODULE);
                    request.headers.set(HeaderConstants.MAP_AGENT, HeaderConstants.SERVICE_MODULE + "/" + version + " (Web)");
                    return [2 /*return*/, this._nextPolicy.sendRequest(request)];
                });
            });
        };
        return AgentPolicy;
    }(BaseRequestPolicy));

    /**
     * AgentPolicyFactory is a factory class helping generating AgentPolicy objects.
     *
     * @export
     * @class AgentPolicyFactory
     * @implements {RequestPolicyFactory}
     */
    var AgentPolicyFactory = /** @class */ (function () {
        function AgentPolicyFactory() {
        }
        AgentPolicyFactory.prototype.create = function (nextPolicy, options) {
            return new AgentPolicy(nextPolicy, options);
        };
        return AgentPolicyFactory;
    }());

    /*
     * Code generated by Microsoft (R) AutoRest Code Generator.
     * Changes may cause incorrect behavior and will be lost if the code is
     * regenerated.
     */
    var packageName = "";
    var packageVersion = "";
    var MapsClientContext = /** @class */ (function (_super) {
        __extends(MapsClientContext, _super);
        /**
         * Initializes a new instance of the MapsClient class.
         * @param credentials Credentials needed for the client to connect to Azure.
         * @param [options] The parameter options
         */
        function MapsClientContext(credentials, options) {
            var _this = this;
            if (credentials == undefined) {
                throw new Error('\'credentials\' cannot be null.');
            }
            if (!options) {
                options = {};
            }
            if (!options.userAgent) {
                var defaultUserAgent = getDefaultUserAgentValue$1();
                options.userAgent = packageName + "/" + packageVersion + " " + defaultUserAgent;
            }
            _this = _super.call(this, credentials, options) || this;
            _this.apiVersion = '1.0';
            _this.acceptLanguage = 'en-US';
            _this.longRunningOperationRetryTimeout = 30;
            _this.baseUri = options.baseUri || _this.baseUri || "https://atlas.microsoft.com";
            _this.requestContentType = "application/json; charset=utf-8";
            _this.credentials = credentials;
            if (options.acceptLanguage !== null && options.acceptLanguage !== undefined) {
                _this.acceptLanguage = options.acceptLanguage;
            }
            if (options.longRunningOperationRetryTimeout !== null && options.longRunningOperationRetryTimeout !== undefined) {
                _this.longRunningOperationRetryTimeout = options.longRunningOperationRetryTimeout;
            }
            return _this;
        }
        return MapsClientContext;
    }(AzureServiceClient));

    /**
     * A MapsURL represents a base URL class for SearchURL, RouteURL and etc.
     *
     * @export
     * @class MapsURL
     */
    var MapsURL = /** @class */ (function () {
        /**
         * Creates an instance of MapsURL.
         * @param {Pipeline} pipeline
         * @param {string} mapsUrl
         * @memberof MapsURL
         */
        function MapsURL(pipeline, mapsUrl) {
            this.pipeline = pipeline;
            if (/^\w+:\/\//.test(mapsUrl)) {
                // If the provided url includes a protocol don't change it.
                this.mapsUrl = mapsUrl;
            }
            else {
                // If the provided url doesn't include a protocol assume https.
                this.mapsUrl = "https://" + mapsUrl;
            }
            // Always include a policy factory for setting the MapAgent and Origin headers.
            var clientOps = this.pipeline.toServiceClientOptions();
            clientOps.requestPolicyFactories.push(new AgentPolicyFactory());
            // Credentials are handled through the pipeline, so an no-op credential is supplied to the client context ctor.
            this.mapsClientContext = new MapsClientContext({ signRequest: Promise.resolve }, __assign(__assign({}, clientOps), { baseUri: this.mapsUrl }));
            // Set the api version and LRO retry timeout.
            this.mapsClientContext.apiVersion = SERVICE_VERSION;
            this.mapsClientContext.longRunningOperationRetryTimeout = 5;
        }
        /**
         * A static method used to create a new Pipeline object with Credential provided.
         *
         * @static
         * @param {Credential} credential Such as SubscriptionKeyCredential, TokenCredential, and MapControlCredential.
         * @param {INewPipelineOptions} [pipelineOptions] Optional. Options.
         * @returns {Pipeline} A new Pipeline object.
         * @memberof Pipeline
         */
        MapsURL.newPipeline = function (credential, pipelineOptions) {
            if (pipelineOptions === void 0) { pipelineOptions = {}; }
            // Order is important. Closer to the API at the top & closer to the network at the bottom.
            // The credential's policy factory must appear close to the wire so it can sign any
            // changes made by other factories (like UniqueRequestIDPolicyFactory)
            var factories = [
                deserializationPolicy(),
                new RetryPolicyFactory(pipelineOptions.retryOptions),
                new LoggingPolicyFactory(),
                credential
            ];
            return new Pipeline(factories, {
                HTTPClient: pipelineOptions.httpClient,
                logger: pipelineOptions.logger
            });
        };
        return MapsURL;
    }());

    /**
     * A RenderURL represents a URL to the Azure Maps render operations.
     *
     * @export
     * @class RenderURL
     * @extends {MapsURL}
     */
    var RenderURL = /** @class */ (function (_super) {
        __extends(RenderURL, _super);
        /**
         * Creates an instance of RenderURL.
         * @param {Pipeline} pipeline Call MapsURL.newPipeline() to create a default
         * pipeline, or provide a customized pipeline.
         * @param {string} mapsUrl A URL string pointing to Azure Maps service, default is
         * `"https://atlas.microsoft.com"`.
         * If no protocol is specified, e.g. `"atlas.microsoft.com"`, then `https` will be assumed.
         * @memberof RenderURL
         */
        function RenderURL(pipeline, mapsUrl) {
            if (mapsUrl === void 0) { mapsUrl = "https://atlas.microsoft.com"; }
            var _this = _super.call(this, pipeline, mapsUrl) || this;
            _this.renderContext = new Render(_this.mapsClientContext);
            return _this;
        }
        /**
         * Returns a map image tile with size 256x256, given the x and y coordinates and zoom
         * level. Zoom level ranges from 0 to 18. The current available style value is 'satellite' which
         * provides satellite
         * imagery alone.
         *
         * Uses the Get Map Imagery Tile API: https://docs.microsoft.com/rest/api/maps/render/getmapimagerytile
         *
         * @param {Aborter} aborter Create a new Aborter instance with Aborter.none or Aborter.timeout(),
         * goto documents of Aborter for more examples about request cancellation.
         * @param {number} zoom Zoom level for the desired tile. Zoom value must be in the range: 0-18 (inclusive).
         *
         * Please see [Zoom Levels and Tile
         * Grid](https://docs.microsoft.com/en-us/azure/location-based-services/zoom-levels-and-tile-grid)
         * for details.
         * @param {number} xTileIndex X coordinate of the tile on zoom grid. Value must be in the range [0,
         * 2<sup>`zoom`</sup> -1].
         *
         * Please see [Zoom Levels and Tile
         * Grid](https://docs.microsoft.com/en-us/azure/location-based-services/zoom-levels-and-tile-grid)
         * for details.
         * @param {number} yTileIndex Y coordinate of the tile on zoom grid. Value must be in the range [0,
         * 2<sup>`zoom`</sup> -1].
         *
         * Please see [Zoom Levels and Tile
         * Grid](https://docs.microsoft.com/en-us/azure/location-based-services/zoom-levels-and-tile-grid)
         * for details.
         * @returns {Promise<GetMapImageryTileResponse>}
         */
        RenderURL.prototype.getMapImageryTile = function (aborter, zoom, xTileIndex, yTileIndex) {
            return __awaiter(this, void 0, void 0, function () {
                var response, _a, _b, _c, _d, _e;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0: return [4 /*yield*/, this.renderContext.getMapImageryTile(zoom, xTileIndex, yTileIndex, {
                                abortSignal: aborter,
                            })];
                        case 1:
                            response = _f.sent();
                            if (!response.readableStreamBody) return [3 /*break*/, 3];
                            _b = (_a = Object).assign;
                            return [4 /*yield*/, streamToByteArray(response.readableStreamBody)];
                        case 2: return [2 /*return*/, _b.apply(_a, [_f.sent(),
                                { rawResponse: response._response }])];
                        case 3:
                            if (!response.blobBody) return [3 /*break*/, 6];
                            _d = (_c = Object).assign;
                            _e = blobToByteArray;
                            return [4 /*yield*/, response.blobBody];
                        case 4: return [4 /*yield*/, _e.apply(void 0, [_f.sent()])];
                        case 5: return [2 /*return*/, _d.apply(_c, [_f.sent(),
                                { rawResponse: response._response }])];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Returns a map tiles in vector or raster format typically to be integrated into a new map control
         * or SDK. By default, Azure uses vector map tiles for its web map control (see [Zoom Levels and
         * Tile
         * Grid](https://docs.microsoft.com/en-us/azure/location-based-services/zoom-levels-and-tile-grid))
         *
         * Uses the Get Map Tile API: https://docs.microsoft.com/rest/api/maps/render/getmaptile
         *
         * @param {Aborter} aborter Create a new Aborter instance with Aborter.none or Aborter.timeout(),
         * goto documents of Aborter for more examples about request cancellation.
         * @param {Models.TileFormat} format Desired format of the response. Possible values are png & pbf. Possible values
         * include: 'png', 'pbf'
         * @param {Models.MapTileLayer} layer Map layer requested. Possible values are basic, hybrid, labels and terra. Possible
         * values include: 'basic', 'hybrid', 'labels', 'terra'
         * @param {Models.MapTileStyle} style Map style to be returned. Possible values are main & shaded_relief. Possible values
         * include: 'main', 'shaded_relief'
         * @param {number} zoom Zoom level for the desired tile. For _raster_ tiles, value must be in the range:
         * 0-18 (inclusive). Terra raster tiles, values must be in the range 0-6 (inclusive). For _vector_
         * tiles, value must be in the range: 0-22 (inclusive).
         *
         * Please see [Zoom Levels and Tile
         * Grid](https://docs.microsoft.com/en-us/azure/location-based-services/zoom-levels-and-tile-grid)
         * for details.
         * @param {number} xTileIndex X coordinate of the tile on zoom grid. Value must be in the range [0,
         * 2<sup>`zoom`</sup> -1].
         *
         * Please see [Zoom Levels and Tile
         * Grid](https://docs.microsoft.com/en-us/azure/location-based-services/zoom-levels-and-tile-grid)
         * for details.
         * @param {number} yTileIndex Y coordinate of the tile on zoom grid. Value must be in the range [0,
         * 2<sup>`zoom`</sup> -1].
         *
         * Please see [Zoom Levels and Tile
         * Grid](https://docs.microsoft.com/en-us/azure/location-based-services/zoom-levels-and-tile-grid)
         * for details.
         * @param {GetMapTileOptions} [options] The optional parameters
         * @returns {Promise<GetMapTileResponse>}
         */
        RenderURL.prototype.getMapTile = function (aborter, format, layer, style, zoom, xTileIndex, yTileIndex, options) {
            if (options === void 0) { options = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var response, _a, _b, _c, _d, _e;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0: return [4 /*yield*/, this.renderContext.getMapTile(format, layer, style, zoom, xTileIndex, yTileIndex, __assign(__assign({}, options), { abortSignal: aborter }))];
                        case 1:
                            response = _f.sent();
                            if (!response.readableStreamBody) return [3 /*break*/, 3];
                            _b = (_a = Object).assign;
                            return [4 /*yield*/, streamToByteArray(response.readableStreamBody)];
                        case 2: return [2 /*return*/, _b.apply(_a, [_f.sent(),
                                { rawResponse: response._response }])];
                        case 3:
                            if (!response.blobBody) return [3 /*break*/, 6];
                            _d = (_c = Object).assign;
                            _e = blobToByteArray;
                            return [4 /*yield*/, response.blobBody];
                        case 4: return [4 /*yield*/, _e.apply(void 0, [_f.sent()])];
                        case 5: return [2 /*return*/, _d.apply(_c, [_f.sent(),
                                { rawResponse: response._response }])];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        /**
         * Renders a user-defined, rectangular image containing a map section
         * using a zoom level from 0 to 20. The static image service renders a user-defined, rectangular
         * image containing a map section using a zoom level from 0 to 20. The supported resolution range
         * for the map image is from 1x1 to 8192x8192. If you are deciding when to use the static image
         * service over the map tile service, you may want to consider how you would like to interact with
         * the rendered map. If the map contents will be relatively unchanging, a static map is a good
         * choice. If you want to support a lot of zooming, panning and changing of the map content, the
         * map tile service would be a better choice.
         *
         * Service also provides Image Composition functionality to get a static image back with additional
         * data like; pushpins and geometry overlays with following S0 and S1 capabilities.
         *
         * In S0 you can:
         * - Render up to 5 pushpins specified in the request
         * - Provide one custom image for the pins referenced in the request
         * - Add labels to the pushpins
         *
         * In S1 you can:
         * - Render pushpins through [Azure Maps Data Service](https://aka.ms/AzureMapsMapDataService)
         * - Specify multiple pushpin styles
         * - Provide custom pushpin images stored in [Azure Maps Data
         * Service](https://aka.ms/AzureMapsMapDataService)
         * - Render circle, polyline and polygon geometry types.
         * - Render of supported GeoJSON geometry types uploaded through [Azure Maps Data
         * Service](https://aka.ms/AzureMapsMapDataService)
         *
         * Please see [How-to-Guide](https://aka.ms/AzureMapsHowToGuideImageCompositor) for detailed
         * examples.
         *
         * _Note_ : Either **center** or **bbox** parameter must be supplied to the
         * API.
         * <br><br>
         * The supported Lat and Lon ranges when using the **bbox** parameter, are as follows:
         * <br><br>
         *
         * |Zoom Level | Max Lon Range   | Max Lat Range|
         * |:----------|:----------------|:-------------|
         * |0          | 360.0           | 170.0        |
         * |1          | 360.0           | 170.0        |
         * |2          | 360.0           | 170.0        |
         * |3          | 360.0           | 170.0        |
         * |4          | 360.0           | 170.0        |
         * |5          | 180.0           | 85.0         |
         * |6          | 90.0            | 42.5         |
         * |7          | 45.0            | 21.25        |
         * |8          | 22.5            | 10.625       |
         * |9          | 11.25           | 5.3125       |
         * |10         | 5.625           | 2.62625      |
         * |11         | 2.8125          | 1.328125     |
         * |12         | 1.40625         | 0.6640625    |
         * |13         | 0.703125        | 0.33203125   |
         * |14         | 0.3515625       | 0.166015625  |
         * |15         | 0.17578125      | 0.0830078125 |
         * |16         | 0.087890625     | 0.0415039063 |
         * |17         | 0.0439453125    | 0.0207519531 |
         * |18         | 0.0219726563    | 0.0103759766 |
         * |19         | 0.0109863281    | 0.0051879883 |
         * |20         | 0.0054931641    | 0.0025939941 |
         *
         * Uses the Get Map Image API: https://docs.microsoft.com/rest/api/maps/render/getmapimage
         * @param {Aborter} aborter Create a new Aborter instance with Aborter.none or Aborter.timeout(),
         * goto documents of Aborter for more examples about request cancellation.
         * @param {GetMapImageOptions} [options] The options
         * @returns {Promise<GetMapImageResponse>}
         */
        RenderURL.prototype.getMapImage = function (aborter, options) {
            return __awaiter(this, void 0, void 0, function () {
                var response, _a, _b, _c, _d, _e;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0: return [4 /*yield*/, this.renderContext.getMapImage(__assign(__assign(__assign(__assign({}, options), (options.center && { center: this.centerToString(options.center) })), (options.bbox && { bbox: this.bboxToString(options.bbox) })), { abortSignal: aborter }))];
                        case 1:
                            response = _f.sent();
                            if (!response.readableStreamBody) return [3 /*break*/, 3];
                            _b = (_a = Object).assign;
                            return [4 /*yield*/, streamToByteArray(response.readableStreamBody)];
                        case 2: return [2 /*return*/, _b.apply(_a, [_f.sent(),
                                { rawResponse: response._response }])];
                        case 3:
                            if (!response.blobBody) return [3 /*break*/, 6];
                            _d = (_c = Object).assign;
                            _e = blobToByteArray;
                            return [4 /*yield*/, response.blobBody];
                        case 4: return [4 /*yield*/, _e.apply(void 0, [_f.sent()])];
                        case 5: return [2 /*return*/, _d.apply(_c, [_f.sent(),
                                { rawResponse: response._response }])];
                        case 6: return [2 /*return*/];
                    }
                });
            });
        };
        /** Converts a GeoJSON center position to a string which can be used as a query param. */
        RenderURL.prototype.centerToString = function (center) {
            if (center.length < 2) {
                throw new Error("The center must contain both longitude " +
                    "and latitude, e.g. [longitude, latitude]");
            }
            return center[0] + "," + center[1];
        };
        /** Converts a GeoJSON bbox to a string which can be used as a query param. */
        RenderURL.prototype.bboxToString = function (bbox) {
            if (bbox.length < 4) {
                throw new Error("The bbox must contain at least four values, " +
                    "e.g. [south lon, west lat, north lon, east lat]");
            }
            return bbox.length < 6 ?
                bbox[0] + "," + bbox[1] + "," + bbox[2] + "," + bbox[3] :
                bbox[0] + "," + bbox[1] + "," + bbox[3] + "," + bbox[4];
        };
        return RenderURL;
    }(MapsURL));

    /**
     * A helper extension providing methods for accessing the response data in GeoJSON format.
     */
    var RouteGeojson = /** @class */ (function () {
        /**
         * Initializes a new route geojson helper.
         * @internal
         */
        function RouteGeojson(response) {
            this.response = response;
        }
        /**
         * Returns a GeoJSON feature collection built from the routes.
         * Each feature in the collection is a MultiLineString representing one route.
         * The MultiLineString contains LineStrings representing a leg of the route.
         * The properties of each feature match the properties of the `route`, except
         * the `legs` property is replaced by a `legSummaries` property which is an array
         * of the summaries of each leg. The coordinates of each leg are already part
         * of the MultiLineString's coordinates. Each feature's properties also includes
         * a resultIndex. The resultIndex is the index of the route within the original `routes` array.
         */
        RouteGeojson.prototype.getFeatures = function () {
            var features = this.response.routes.map(function (route, index) {
                var multiLineCoords = route.legs.map(function (leg) {
                    return leg.points.map(function (coord) {
                        return [coord.longitude, coord.latitude];
                    });
                });
                // Include all properties on the route object except legs.
                // Legs is used to create the MultiLineString, so we only need the summaries.
                // The legSummaries property replaces the legs property with just summary data.
                var props = __assign(__assign({}, route), { legSummaries: route.legs.map(function (leg) { return leg.summary; }), resultIndex: index });
                delete props.legs;
                return {
                    type: "Feature",
                    geometry: {
                        type: "MultiLineString",
                        coordinates: multiLineCoords
                    },
                    properties: props
                };
            });
            return {
                type: "FeatureCollection",
                features: features,
                bbox: calculateBoundingBox(features)
            };
        };
        return RouteGeojson;
    }());

    /**
     * A helper extension providing methods for accessing the response data in GeoJSON format.
     */
    var RouteRangeGeojson = /** @class */ (function () {
        /**
         * Initializes a new route range geojson helper.
         * @internal
         */
        function RouteRangeGeojson(response) {
            this.response = response;
        }
        /**
         * Returns a GeoJSON feature collection built from the reachable range.
         * The first feature in the collection is a Polygon representing the boundary of the reachable range.
         * The second feature is a Point representing the center point of the reachable range.
         */
        RouteRangeGeojson.prototype.getFeatures = function () {
            var range = {
                type: "Feature",
                geometry: {
                    type: "Polygon",
                    coordinates: [
                        this.response.reachableRange.boundary.map(function (coord) { return [coord.longitude, coord.latitude]; })
                    ]
                },
                properties: {}
            };
            var center = {
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [
                        this.response.reachableRange.center.longitude,
                        this.response.reachableRange.center.latitude
                    ]
                },
                properties: {}
            };
            return {
                type: "FeatureCollection",
                features: [range, center],
                bbox: calculateBoundingBox([range])
            };
        };
        return RouteRangeGeojson;
    }());

    /**
     * A RouteURL represents a URL to the Azure Maps route operations.
     *
     * @export
     * @class RouteURL
     * @extends {MapsURL}
     */
    var RouteURL = /** @class */ (function (_super) {
        __extends(RouteURL, _super);
        /**
         * Creates an instance of RouteURL.
         * @param {Pipeline} pipeline Call MapsURL.newPipeline() to create a default
         * pipeline, or provide a customized pipeline.
         * @param {string} mapsUrl A URL string pointing to Azure Maps service, default is
         * `"https://atlas.microsoft.com"`.
         * If no protocol is specified, e.g. `"atlas.microsoft.com"`, then `https` will be assumed.
         * @memberof RouteURL
         */
        function RouteURL(pipeline, mapsUrl) {
            if (mapsUrl === void 0) { mapsUrl = "https://atlas.microsoft.com"; }
            var _this = _super.call(this, pipeline, mapsUrl) || this;
            _this.routeContext = new Route(_this.mapsClientContext);
            return _this;
        }
        /**
         * Returns  a route between an origin and a destination, passing through waypoints if they are
         * specified. The route will take into account factors such as current traffic and the typical road
         * speeds on the requested day of the week and time of day.
         *
         * Information returned includes the distance, estimated travel time, and a representation of the
         * route geometry. Additional routing information such as optimized waypoint order or turn by turn
         * instructions is also available, depending on the options selected.
         *
         * Routing service provides a set of parameters for a detailed description of vehicle-specific
         * Consumption Model. Please check [Consumption
         * Model](https://docs.microsoft.com/azure/azure-maps/consumption-model) for detailed explanation
         * of the concepts and parameters involved.
         *
         * If `options.postBody` is specified uses the Post Route Directions API: https://docs.microsoft.com/rest/api/maps/route/postroutedirections
         *
         * Otherwise uses the Get Route Directions API: https://docs.microsoft.com/rest/api/maps/route/getroutedirections
         *
         * @param {Aborter} aborter Create a new Aborter instance with Aborter.none or Aborter.timeout(),
         * goto documents of Aborter for more examples about request cancellation.
         * @param {GeoJSON.Position[]} coordinates An array of coordinates through which the route is calculated.
         * Each coordinate is an array of `[longitude, latitude]`. A minimum of two coordinates is required.
         * The first one is the origin and the last is the destination of the route.
         * Optional coordinates in-between act as WayPoints in the route. You can pass up to 150 WayPoints.
         * @param {CalculateRouteDirectionsOptions} [options]
         * @returns {Promise<CalculateRouteDirectionsResponse>}
         * @memberof RouteURL
         */
        RouteURL.prototype.calculateRouteDirections = function (aborter, coordinates, options) {
            if (options === void 0) { options = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var query, response, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (coordinates.length < 2) {
                                throw new Error("The coordinates must contain at least two positions");
                            }
                            query = coordinates
                                .map(function (coordinate) {
                                if (coordinate.length < 2) {
                                    throw new Error("The coordinate must contain both longitude " +
                                        "and latitude, e.g. [longitude, latitude]");
                                }
                                return coordinate[1] + "," + coordinate[0];
                            })
                                .join(":");
                            if (!options.postBody) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.routeContext.postRouteDirections(query, options.postBody, __assign(__assign({}, options), { abortSignal: aborter }))];
                        case 1:
                            _a = _b.sent();
                            return [3 /*break*/, 4];
                        case 2: return [4 /*yield*/, this.routeContext.getRouteDirections(query, __assign(__assign({}, options), { abortSignal: aborter }))];
                        case 3:
                            _a = _b.sent();
                            _b.label = 4;
                        case 4:
                            response = _a;
                            return [2 /*return*/, __assign(__assign({}, response), { rawResponse: response._response, geojson: new RouteGeojson(response) })];
                    }
                });
            });
        };
        /**
         * Calculate a set of locations that can be reached from the origin point based
         * on fuel, energy,  or time budget that is specified. A polygon boundary (or Isochrone) is
         * returned in a counterclockwise  orientation as well as the precise polygon center which was the
         * result of the origin point.
         *
         * The returned polygon can be used for further processing such as  [Search Inside
         * Geometry](https://docs.microsoft.com/rest/api/maps/search/getsearchinsidegeometry) to
         * search for POIs within the provided Isochrone.
         *
         * Uses the Get Route Range API: https://docs.microsoft.com/rest/api/maps/route/getrouterange
         *
         * @param {Aborter} aborter Create a new Aborter instance with Aborter.none or Aborter.timeout(),
         * goto documents of Aborter for more examples about request cancellation.
         * @param {GeoJSON.Position} center The coordinate from which the range calculation should start.
         * @param {CalculateRouteRangeOptions} [options] The optional parameters
         * @returns {Promise<CalculateRouteRangeResponse>}
         * @memberof RouteURL
         */
        RouteURL.prototype.calculateRouteRange = function (aborter, center, options) {
            if (options === void 0) { options = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var query, response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (center.length < 2) {
                                throw new Error("The center must contain both longitude " +
                                    "and latitude, e.g. [longitude, latitude]");
                            }
                            query = center[1] + "," + center[0];
                            return [4 /*yield*/, this.routeContext.getRouteRange(query, __assign(__assign({}, options), { abortSignal: aborter }))];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, __assign(__assign({}, response), { rawResponse: response._response, geojson: new RouteRangeGeojson(response) })];
                    }
                });
            });
        };
        /**
         * **Note: This API is currently in preview and may be subject to breaking changes.**
         * Calculates a matrix of route summaries for a set of routes
         * defined by origin and destination locations. For every given origin, this service calculates the
         * cost of routing from that origin to every given destination. The set of origins and the set of
         * destinations can be thought of as the column and row headers of a table and each cell in the
         * table contains the costs of routing from the origin to the destination for that cell. For each
         * route, the travel times and distances are calculated. You can use the computed costs to
         * determine which routes to calculate using the Routing Directions API. If waitForResults
         * parameter in the request is set to false (default value), this API returns a 202 response code
         * along a redirect URL in the Location field of the response header. This URL should be checked
         * periodically until the response data or error information is available.
         *
         * The maximum size of a matrix for this API is 700 (the number of origins  multiplied by the
         * number of destinations). With that constraint in mind,  examples of possible matrix dimensions
         * are: 50x10, 10x10, 28x25. 10x70  (it does not need to be square).
         *
         * Calculating a route matrix is considered a long running operation.
         * A long running operations implies that after the initial request is accepted (HTTP 202)
         * the final result will be polled for until available.
         * Each poll request restarts the aborter's timeout, if one was specified.
         *
         * Uses the Post Route Matrix API: https://docs.microsoft.com/rest/api/maps/route/postroutematrixpreview
         *
         * @param {Aborter} aborter Create a new Aborter instance with Aborter.none or Aborter.timeout(),
         * goto documents of Aborter for more examples about request cancellation.
         * @param {CalculateRouteMatrixRequestBody} body The matrix of origin and destination coordinates to compute the route
         * distance, travel time and other summary for each cell of the matrix based on the input
         * parameters. The minimum and the maximum cell count supported are 1 and 700 respectively. For
         * example, it can be 35 origins and 20 destinations or 25 origins and 25 destinations.
         * @param {CalculateRouteMatrixOptions} [options] The optional parameters
         * @returns {Promise<CalculateRouteMatrixResponse>}
         * @memberof RouteURL
         */
        RouteURL.prototype.calculateRouteMatrix = function (aborter, body, options) {
            if (options === void 0) { options = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.routeContext.postRouteMatrixPreview(body, __assign(__assign({}, options), { abortSignal: aborter }))];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, __assign(__assign({}, response), { rawResponse: response._response })];
                    }
                });
            });
        };
        return RouteURL;
    }(MapsURL));

    /**
     * A helper extension providing methods for accessing the response data in GeoJSON format.
     */
    var SearchGeojson = /** @class */ (function () {
        /**
         * Initializes a new search geojson helper.
         * @internal
         */
        function SearchGeojson(response) {
            this.response = response;
        }
        /**
         * Returns a GeoJSON feature collection built from the results.
         * Each feature in the collection is a Point representing one result.
         * The properties of each feature match the properties of the `result`,
         * except the `position` property is omitted because it is already
         * the coordinate of the point. Each feature's properties also includes
         * a resultIndex. The resultIndex is the index of the route within the
         * original `results` array.
         */
        SearchGeojson.prototype.getFeatures = function () {
            var features = [];
            for (var i = 0; i < this.response.results.length; i++) {
                // Include all properties on the result object except position.
                // Position is already part of the coordinates.
                var result = this.response.results[i];
                var props = __assign(__assign({}, result), { resultIndex: i });
                delete props.position;
                var feature = {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [result.position.lon, result.position.lat]
                    },
                    properties: props
                };
                if (result.id) {
                    feature.id = result.id;
                }
                if (result.viewport) {
                    feature.bbox = [
                        result.viewport.topLeftPoint.lon,
                        result.viewport.btmRightPoint.lat,
                        result.viewport.btmRightPoint.lon,
                        result.viewport.topLeftPoint.lat
                    ];
                }
                features.push(feature);
            }
            return {
                type: "FeatureCollection",
                features: features,
                bbox: calculateBoundingBox(features)
            };
        };
        return SearchGeojson;
    }());

    /**
     * A helper extension providing methods for accessing the response data in GeoJSON format.
     */
    var SearchPolygonGeojson = /** @class */ (function () {
        /**
         * Initializes a new search geojson helper.
         * @internal
         */
        function SearchPolygonGeojson(response) {
            this.response = response;
        }
        /**
         * Returns a GeoJSON feature collection built from the results.
         * Each feature in the collection is a Polygon or MultiPolygon representing one geometry ID.
         * The properties of each feature match the properties of `additionalData`,
         * except the `geometryData` is omitted because it is redundant with the feature itself.
         * The properties of the features in `geometryData` are kept too.
         */
        SearchPolygonGeojson.prototype.getFeatures = function () {
            var features = [];
            for (var _i = 0, _a = this.response.additionalData; _i < _a.length; _i++) {
                var data = _a[_i];
                var collection = data.geometryData;
                for (var _b = 0, _c = collection.features; _b < _c.length; _b++) {
                    var feature = _c[_b];
                    // Include all properties already on the feature and the data
                    // The geometryData is already part of the feature so remove it.
                    var props = __assign(__assign({}, feature.properties), data);
                    delete props.geometryData;
                    features.push({
                        type: "Feature",
                        geometry: feature.geometry,
                        properties: props
                    });
                }
            }
            return {
                type: "FeatureCollection",
                features: features,
                bbox: calculateBoundingBox(features)
            };
        };
        return SearchPolygonGeojson;
    }());

    /**
     * A helper extension providing methods for accessing the response data in GeoJSON format.
     */
    var SearchReverseGeojson = /** @class */ (function () {
        /**
         * Initializes a new route geojson helper.
         * @internal
         */
        function SearchReverseGeojson(response) {
            this.response = response;
        }
        /**
         * Returns a GeoJSON feature collection built from the addresses.
         * Each feature in the collection is a Point representing one address.
         * The properties of each feature match the properties of the `address`,
         * except the `position` property is omitted because it is already the
         * coordinate of the point. Each feature's properties also includes
         * a resultIndex. The resultIndex is the index of the route within the
         * original `addresses` array.
         */
        SearchReverseGeojson.prototype.getFeatures = function () {
            var features = [];
            for (var i = 0; i < this.response.addresses.length; i++) {
                // Include all properties on the result object except position.
                // Position is already part of the coordinates.
                var address = this.response.addresses[i];
                var props = __assign(__assign({}, address), { resultIndex: i });
                delete props.position;
                var _a = address.position.split(",").map(Number.parseFloat), lat = _a[0], lon = _a[1];
                var feature = {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [lon, lat]
                    },
                    properties: props
                };
                features.push(feature);
            }
            return {
                type: "FeatureCollection",
                features: features,
                bbox: calculateBoundingBox(features)
            };
        };
        return SearchReverseGeojson;
    }());

    /**
     * A SearchURL represents a URL to the Azure Maps search operations.
     *
     * @export
     * @class SearchURL
     * @extends {MapsURL}
     */
    var SearchURL = /** @class */ (function (_super) {
        __extends(SearchURL, _super);
        /**
         * Creates an instance of SearchURL.
         * @param {Pipeline} pipeline Call MapsURL.newPipeline() to create a default
         * pipeline, or provide a customized pipeline.
         * @param {string} mapsUrl A URL string pointing to Azure Maps service, default is
         * `"https://atlas.microsoft.com"`.
         * If no protocol is specified, e.g. `"atlas.microsoft.com"`, then `https` will be assumed.
         * @memberof SearchURL
         */
        function SearchURL(pipeline, mapsUrl) {
            if (mapsUrl === void 0) { mapsUrl = "https://atlas.microsoft.com"; }
            var _this = _super.call(this, pipeline, mapsUrl) || this;
            _this.searchContext = new Search(_this.mapsClientContext);
            return _this;
        }
        /**
         * **Free Form Search** The basic default API is Free Form Search which handles the most
         * fuzzy of inputs handling any combination of address or POI tokens.
         * This search API is the canonical 'single line search'.
         * The Free Form Search API is a seamless combination of POI search and geocoding.
         * The API can also be weighted with a contextual position (lat./lon. pair), or
         * fully constrained by a coordinate and radius, or it can be executed more generally without any
         * geo biasing anchor point.
         * We strongly advise you to use the 'countrySet' parameter to specify only the countries for
         * which your application needs coverage, as the default behavior will be to search the entire world,
         * potentially returning unnecessary results. E.g.: `countrySet`=US,FR. Please see [Search Coverage]
         * (https://docs.microsoft.com/azure/location-based-services/geocoding-coverage) for
         * a complete list of all the supported countries.
         * Most Search queries default to `maxFuzzyLevel`=2 to gain performance and also reduce unusual results.
         * This new default can be overridden as needed per request by passing in the query param `maxFuzzyLevel`=3 or 4.
         * Uses the Get Search Fuzzy API: https://docs.microsoft.com/rest/api/maps/search/getsearchfuzzy
         * @param {Aborter} aborter Create a new Aborter instance with Aborter.none or Aborter.timeout(),
         * goto documents of Aborter for more examples about request cancellation.
         * @param {string | GeoJSON.Position} query The applicable query string (e.g., "seattle", "pizza").
         * Can _also_ be specified as a coordinate array of `[longitude, latitude]` (e.g., `[-122.125679, 47.641268]`).
         * @param {SearchFuzzyOptions} [options] The optional parameters
         * @returns {Promise<SearchFuzzyResponse>}
         * @memberof SearchURL
         */
        SearchURL.prototype.searchFuzzy = function (aborter, query, options) {
            if (options === void 0) { options = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (Array.isArray(query)) {
                                if (query.length > 1) {
                                    query = query[1] + "," + query[0];
                                }
                                else {
                                    throw new Error("The query must contain both longitude " +
                                        "and latitude, e.g. [longitude, latitude]");
                                }
                            }
                            return [4 /*yield*/, this.searchContext.getSearchFuzzy(query, __assign(__assign({}, options), { abortSignal: aborter }))];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, __assign(__assign({}, response), { rawResponse: response._response, geojson: new SearchGeojson(response) })];
                    }
                });
            });
        };
        /**
         * **Get POI by Name** If your search use case only requires POI results, you may use the
         * POI endpoint for searching.
         * This endpoint will only return POI results.
         * Uses the Get Search POI API: https://docs.microsoft.com/rest/api/maps/search/getsearchpoi
         * @param {Aborter} aborter Create a new Aborter instance with Aborter.none or Aborter.timeout(),
         * goto documents of Aborter for more examples about request cancellation.
         * @param {string} query The POI name to search for (e.g., "statue of liberty", "starbucks").
         * @param {SearchPOIOptions} [options] The optional parameters
         * @returns {Promise<SearchPOIResponse>}
         * @memberof SearchURL
         */
        SearchURL.prototype.searchPOI = function (aborter, query, options) {
            if (options === void 0) { options = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.searchContext.getSearchPOI(query, __assign(__assign({}, options), { abortSignal: aborter }))];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, __assign(__assign({}, response), { rawResponse: response._response, geojson: new SearchGeojson(response) })];
                    }
                });
            });
        };
        /**
         * **Nearby Search** If you have a use case for only retrieving POI results around a
         * specific location, the nearby search method may be the right choice.
         * This endpoint will only return POI results, and does not take in a search query parameter.
         * Uses the Get Search Nearby API: https://docs.microsoft.com/rest/api/maps/search/getsearchnearby
         * @param {Aborter} aborter Create a new Aborter instance with Aborter.none or Aborter.timeout(),
         * goto documents of Aborter for more examples about request cancellation.
         * @param {GeoJSON.Position} location Location where results should be biased.
         * Should be an array of `[longitude, latitude]`, E.g. `[-121.89, 37.337]`.
         * @param {SearchNearbyOptions} [options] The optional parameters
         * @returns {Promise<SearchNearbyResponse>}
         * @memberof SearchURL
         */
        SearchURL.prototype.searchNearby = function (aborter, location, options) {
            if (options === void 0) { options = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var lon, lat, response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (location.length < 2) {
                                throw new Error("The query must contain both longitude " +
                                    "and latitude, e.g. [longitude, latitude]");
                            }
                            lon = location[0], lat = location[1];
                            return [4 /*yield*/, this.searchContext.getSearchNearby(lat, lon, __assign(__assign({}, options), { abortSignal: aborter }))];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, __assign(__assign({}, response), { rawResponse: response._response, geojson: new SearchGeojson(response) })];
                    }
                });
            });
        };
        /**
         * **Get POI by Category** If your search use case only requires POI results filtered by
         * category, you may use the category endpoint.
         * This endpoint will only return POI results which are categorized as specified.
         * List of available categories can be found [here](https://docs.microsoft.com/azure/azure-maps/search-categories).
         * Uses the Get Search POI Category API: https://docs.microsoft.com/rest/api/maps/search/getsearchpoicategory
         * @param {Aborter} aborter Create a new Aborter instance with Aborter.none or Aborter.timeout(),
         * goto documents of Aborter for more examples about request cancellation.
         * @param {string} query The POI category to search for (e.g., "AIRPORT", "BEACH").
         * @param {SearchPOICategoryOptions} [options] The optional parameters
         * @returns {Promise<SearchPOICategoryResponse>}
         * @memberof SearchURL
         */
        SearchURL.prototype.searchPOICategory = function (aborter, query, options) {
            if (options === void 0) { options = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.searchContext.getSearchPOICategory(query, __assign(__assign({}, options), { abortSignal: aborter }))];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, __assign(__assign({}, response), { rawResponse: response._response, geojson: new SearchGeojson(response) })];
                    }
                });
            });
        };
        /**
         * **Address Geocoding** In many cases, the complete search service might be too much, for
         * instance if you are only interested in traditional geocoding.
         * Search can also be accessed for address look up exclusively.
         * The geocoding is performed by hitting the geocode endpoint with just the address or
         * partial address in question.
         * The geocoding search index will be queried for everything above the street level data.
         * No POIs will be returned.
         * Note that the geocoder is very tolerant of typos and incomplete addresses.
         * It will also handle everything from exact street addresses or street or intersections
         * as well as higher level geographies such as city centers, counties, states etc.
         * Uses the Get Search Address API: https://docs.microsoft.com/rest/api/maps/search/getsearchaddress
         * @param {Aborter} aborter Create a new Aborter instance with Aborter.none or Aborter.timeout(),
         * goto documents of Aborter for more examples about request cancellation.
         * @param {string} query The address to search for (e.g., "1 Microsoft way, Redmond, WA").
         * @param {SearchAddressOptions} [options] The optional parameters
         * @returns {Promise<SearchAddressResponse>}
         * @memberof SearchURL
         */
        SearchURL.prototype.searchAddress = function (aborter, query, options) {
            if (options === void 0) { options = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.searchContext.getSearchAddress(query, __assign(__assign({}, options), { abortSignal: aborter }))];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, __assign(__assign({}, response), { rawResponse: response._response, geojson: new SearchGeojson(response) })];
                    }
                });
            });
        };
        /**
         * **Reverse Geocode to an Address** There may be times when you need to translate a
         * coordinate (example: -122.3862, 37.786505) into a human understandable street address.
         * Most often this is needed in tracking applications where you receive a GPS feed from the device or
         * asset and wish to know what address where the coordinate is located.
         * This endpoint will return address information for a given coordinate.
         * Uses the Get Search Address Reverse API: https://docs.microsoft.com/rest/api/maps/search/getsearchaddressreverse
         * @param {Aborter} aborter Create a new Aborter instance with Aborter.none or Aborter.timeout(),
         * goto documents of Aborter for more examples about request cancellation.
         * @param {GeoJSON.Position} position The position to reverse search,
         * a coordinate array of `[longitude, latitude]` e.g. `[-122.125679, 47.641268]`.
         * @param {SearchAddressReverseOptions} [options] The optional parameters
         * @returns {Promise<SearchFuzzyResponse>}
         * @memberof SearchURL
         */
        SearchURL.prototype.searchAddressReverse = function (aborter, position, options) {
            if (options === void 0) { options = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var query, response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (position.length < 2) {
                                throw new Error("The position must contain both longitude " +
                                    "and latitude, e.g. [longitude, latitude]");
                            }
                            query = position[1] + "," + position[0];
                            return [4 /*yield*/, this.searchContext.getSearchAddressReverse(query, __assign(__assign({}, options), { abortSignal: aborter }))];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, __assign(__assign({}, response), { rawResponse: response._response, geojson: new SearchReverseGeojson(response) })];
                    }
                });
            });
        };
        /**
         * **Reverse Geocode to a Cross Street** There may be times when you need to translate a
         * coordinate (example: -122.3862, 37.786505) into a human understandable cross street.
         * Most often this is needed in tracking applications where you receive a GPS feed from the device or asset
         * and wish to know what address where the coordinate is located.
         * This endpoint will return cross street information for a given coordinate.
         * Uses the Get Search Address Reverse Cross Street API: https://docs.microsoft.com/rest/api/maps/search/getsearchaddressreversecrossstreet
         * @param {Aborter} aborter Create a new Aborter instance with Aborter.none or Aborter.timeout(),
         * goto documents of Aborter for more examples about request cancellation.
         * @param {GeoJSON.Position} position The position to reverse search,
         * a coordinate array of `[longitude, latitude]` e.g. `[-122.125679, 47.641268]`.
         * @param {SearchAddressReverseCrossStreetOptions} [options] The optional parameters
         * @returns {Promise<SearchAddressReverseCrossStreetResponse>}
         * @memberof SearchURL
         */
        SearchURL.prototype.searchAddressReverseCrossStreet = function (aborter, position, options) {
            if (options === void 0) { options = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var query, response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (position.length < 2) {
                                throw new Error("The position must contain both longitude " +
                                    "and latitude, e.g. [longitude, latitude]");
                            }
                            query = position[1] + "," + position[0];
                            return [4 /*yield*/, this.searchContext.getSearchAddressReverseCrossStreet(query, __assign(__assign({}, options), { abortSignal: aborter }))];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, __assign(__assign({}, response), { rawResponse: response._response, geojson: new SearchReverseGeojson(response) })];
                    }
                });
            });
        };
        /**
         * **Structured Address Geocoding** Azure Address Geocoding can also be accessed for
         * structured address look up exclusively.
         * The geocoding search index will be queried for everything above the street level data.
         * No POIs will be returned. Note that the geocoder is very tolerant of typos and incomplete addresses.
         * It will also handle everything from exact street addresses or street or intersections as well as
         * higher level geographies such as city centers, counties, states etc.
         * Uses the Get Search Address Structured API: https://docs.microsoft.com/rest/api/maps/search/getsearchaddressstructured
         * @param {Aborter} aborter Create a new Aborter instance with Aborter.none or Aborter.timeout(),
         * goto documents of Aborter for more examples about request cancellation.
         * @param {string} countryCode The 2 or 3 letter
         * [ISO3166-1](https://www.iso.org/iso-3166-country-codes.html) country code portion of an address.
         * E.g. US.
         * @param {SearchAddressStructuredOptions} [options] The optional parameters
         * @returns {Promise<SearchAddressStructuredResponse>}
         * @memberof SearchURL
         */
        SearchURL.prototype.searchAddressStructured = function (aborter, countryCode, options) {
            if (options === void 0) { options = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.searchContext.getSearchAddressStructured(countryCode, __assign(__assign({}, options), { abortSignal: aborter }))];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, __assign(__assign({}, response), { rawResponse: response._response, geojson: new SearchGeojson(response) })];
                    }
                });
            });
        };
        /**
         * The Search Geometry endpoint allows you to perform a free form search inside a single geometry
         * or many of them.
         * The search results that fall inside the geometry/geometries will be returned.
         * The geographical features to be searched can be modeled as Polygon and/or Circle geometries
         * represented using any one of the following `GeoJSON` types: **GeoJSON FeatureCollection**,
         * The `geometry` can be represented as a `GeoJSON FeatureCollection` object.
         * This is the recommended option if the geometry contains both Polygons and Circles.
         * The `FeatureCollection` can contain a max of 50 `GeoJSON Feature` objects.
         * Each `Feature` object should represent either a Polygon or a Circle with the following conditions:
         * A `Feature` object for the Polygon geometry can have a max of 50 coordinates and it's properties must be empty.
         * A `Feature` object for the Circle geometry is composed of a _center_ represented using a `GeoJSON Point` type and a _radius_ value
         * (in meters) which must be specified in the object's properties along with the _subType_ property
         * whose value should be 'Circle'.
         * Please see the Examples section below for a sample `FeatureCollection` representation.
         * **GeoJSON GeometryCollection**, The `geometry` can be represented as a `GeoJSON GeometryCollection` object.
         * This is the recommended option if the geometry contains a list of Polygons only.
         * The `GeometryCollection` can contain a max of 50 `GeoJSON Polygon` objects.
         * Each `Polygon` object can have a max of 50 coordinates.
         * Please see the Examples section below for a sample `GeometryCollection` representation.
         * **GeoJSON Polygon**, The `geometry` can be represented as a `GeoJSON Polygon` object.
         * This is the recommended option if the geometry contains a single Polygon.
         * The `Polygon` object can have a max of 50 coordinates.
         * Uses the Post Search Inside Geometry API: https://docs.microsoft.com/rest/api/maps/search/postsearchinsidegeometry
         * @param {Aborter} aborter Create a new Aborter instance with Aborter.none or Aborter.timeout(),
         * goto documents of Aborter for more examples about request cancellation.
         * @param {string | number[]} query The applicable query string (e.g., "seattle", "pizza").
         * @param {SearchInsideGeometryRequestBody} body This represents the geometry for one or more geographical
         * features (parks, state boundary etc.) to search in and should be a GeoJSON compliant type.
         * Please refer to [RFC 7946](https://tools.ietf.org/html/rfc7946) for details.
         * @param {SearchInsideGeometryOptions} [options] The optional parameters
         * @returns {Promise<SearchInsideGeometryResponse>}
         * @memberof SearchURL
         */
        SearchURL.prototype.searchInsideGeometry = function (aborter, query, body, options) {
            if (options === void 0) { options = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.searchContext.postSearchInsideGeometry(query, body, __assign(__assign({}, options), { abortSignal: aborter }))];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, __assign(__assign({}, response), { rawResponse: response._response, geojson: new SearchGeojson(response) })];
                    }
                });
            });
        };
        /**
         * The Search Along Route endpoint allows you to perform a fuzzy search for POIs along a specified
         * route.
         * This search is constrained by specifying the `maxDetourTime` limiting measure.
         * To send the route-points you will use a `body` which will contain the `route` object represented
         * as a `GeoJSON LineString` type and the `Content-Type` header will be set to `application/json`.
         * Each route-point in `route` is represented as a `GeoJSON Position` type i.e. an array where the
         * _longitude_ value is followed by the _latitude_ value and the _altitude_ value is ignored.
         * The `route` should contain at least 2 route-points.
         * It is possible that original route will be altered, some of it's points may be skipped.
         * If the route that passes through the found point is faster than the original one, the `detourTime` value in
         * the response is negative.
         * Uses the Post Search Along Route API: https://docs.microsoft.com/rest/api/maps/search/postsearchalongroute
         * @param {Aborter} aborter Create a new Aborter instance with Aborter.none or Aborter.timeout(),
         * goto documents of Aborter for more examples about request cancellation.
         * @param {string | number[]} query The applicable query string (e.g., "seattle", "pizza").
         * @param {number} maxDetourTime Maximum detour time of the point of interest in seconds. Max value is 3600
         * seconds
         * @param {SearchAlongRouteRequestBody} body This represents the route to search along and should be a
         * valid `GeoJSON LineString` type. Please refer to [RFC
         * 7946](https://tools.ietf.org/html/rfc7946#section-3.1.4) for details.
         * @param {SearchAlongRouteOptions} [options] The optional parameters
         * @returns {Promise<SearchAlongRouteResponse>}
         * @memberof SearchURL
         */
        SearchURL.prototype.searchAlongRoute = function (aborter, query, maxDetourTime, body, options) {
            if (options === void 0) { options = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.searchContext.postSearchAlongRoute(query, maxDetourTime, body, __assign(__assign({}, options), { abortSignal: aborter }))];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, __assign(__assign({}, response), { rawResponse: response._response, geojson: new SearchGeojson(response) })];
                    }
                });
            });
        };
        /**
         * The Search Polygon API allows you to request the geometry data such as a city or country
         * outline for a set of entities, previously retrieved from an Online Search request in GeoJSON
         * format. The geometry  ID is returned in the dataSources object under "geometry" and "id" in
         * either a Search Address or Search Fuzzy call.
         *
         * Please note that any geometry ID retrieved from an Online Search endpoint has a limited
         * lifetime. The client  should not store geometry IDs in persistent storage for later referral, as
         * the stability of these identifiers is  not guaranteed for a long period of time. It is expected
         * that a request to the Polygon method is made within a  few minutes of the request to the Online
         * Search method that provided the ID. The service allows for batch  requests up to 20 identifiers.
         *
         * Uses the Get Search Polygon API: https://docs.microsoft.com/rest/api/maps/search/getsearchpolygon
         *
         * @param {Aborter} aborter Create a new Aborter instance with Aborter.none or Aborter.timeout(),
         * goto documents of Aborter for more examples about request cancellation.
         * @param {string} geometries Comma separated list of geometry UUIDs, previously retrieved from an Online
         * Search request.
         * @returns {Promise<SearchPolygonResponse>}
         * @memberof SearchURL
         */
        SearchURL.prototype.searchPolygon = function (aborter, geometries) {
            return __awaiter(this, void 0, void 0, function () {
                var query, response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (geometries.length < 1) {
                                throw new Error("At least one geometry UUID must be specified");
                            }
                            query = geometries.join(",");
                            return [4 /*yield*/, this.searchContext.getSearchPolygon(query, {
                                    abortSignal: aborter
                                })];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, __assign(__assign({}, response), { rawResponse: response._response, geojson: new SearchPolygonGeojson(response) })];
                    }
                });
            });
        };
        return SearchURL;
    }(MapsURL));

    /**
     * A helper extension providing methods for accessing the response data in GeoJSON format.
     */
    var ClosestPointGeojson = /** @class */ (function () {
        /**
         * Initializes a new closest point geojson helper.
         * @internal
         */
        function ClosestPointGeojson(response) {
            this.response = response;
        }
        /**
         * Returns a GeoJSON feature collection built from the results.
         * The collection will include a Point feature for each `result`.
         * The properties of the features match the properties of the result, except
         * the `position` property is omitted because it is redundant with the feature's coordinates.
         */
        ClosestPointGeojson.prototype.getFeatures = function () {
            var features = this.response.result.map(function (result) {
                // Include all the properties of the result object except position.
                var props = __assign({}, result);
                delete props.position;
                return {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [
                            result.position.lon,
                            result.position.lat
                        ]
                    },
                    properties: props
                };
            });
            return {
                type: "FeatureCollection",
                bbox: calculateBoundingBox(features),
                features: features
            };
        };
        return ClosestPointGeojson;
    }());

    /**
     * A helper extension providing methods for accessing the response data in GeoJSON format.
     */
    var GeofenceGeojson = /** @class */ (function () {
        /**
         * Initializes a new closest point geojson helper.
         * @internal
         */
        function GeofenceGeojson(response) {
            this.response = response;
        }
        /**
         * Returns a GeoJSON feature collection built from the results.
         * The collection will include a Point feature for each of the `geometries`.
         * The properties of the features match the properties of the geofence geometry,
         * except the `nearestLat` and `nearestLon` properties are omitted
         * because they are redundant with the feature's coordinates.
         */
        GeofenceGeojson.prototype.getFeatures = function () {
            var features = this.response.geometries.map(function (geometry) {
                // Include all the properties of the geometry object except lat and lon.
                var props = __assign({}, geometry);
                delete props.nearestLat;
                delete props.nearestLon;
                return {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [
                            geometry.nearestLon,
                            geometry.nearestLat
                        ]
                    },
                    properties: props
                };
            });
            return {
                type: "FeatureCollection",
                bbox: calculateBoundingBox(features),
                features: features
            };
        };
        return GeofenceGeojson;
    }());

    /**
     * A helper extension providing methods for accessing the response data in GeoJSON format.
     */
    var PointInPolygonGeojson = /** @class */ (function () {
        /**
         * Initializes a new closest point geojson helper.
         * @internal
         */
        function PointInPolygonGeojson(response) {
            this.response = response;
        }
        /**
         * Returns a GeoJSON feature collection built from the results.
         * The collection will include one Point feature representing the input.
         * The properties of the feature match the properties of the `result` and `summary`,
         * except the `sourcePoint` will be omitted because it is redundant with the feature's coordinates.
         */
        PointInPolygonGeojson.prototype.getFeatures = function () {
            // Include all the properties of the geometry object except sourcePoint.
            var props = __assign(__assign({}, this.response.result), this.response.summary);
            delete props.sourcePoint;
            var features = [{
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [
                            this.response.summary.sourcePoint.lon,
                            this.response.summary.sourcePoint.lat
                        ]
                    },
                    properties: props
                }];
            return {
                type: "FeatureCollection",
                bbox: calculateBoundingBox(features),
                features: features
            };
        };
        return PointInPolygonGeojson;
    }());

    /**
     * A SpatialURL represents a URL to the Azure Maps spatial operations.
     *
     * @export
     * @class SpatialURL
     * @extends {MapsURL}
     */
    var SpatialURL = /** @class */ (function (_super) {
        __extends(SpatialURL, _super);
        /**
         * Creates an instance of SpatialURL.
         * @param {Pipeline} pipeline Call MapsURL.newPipeline() to create a default
         * pipeline, or provide a customized pipeline.
         * @param {string} mapsUrl A URL string pointing to Azure Maps service, default is
         * `"https://atlas.microsoft.com"`.
         * If no protocol is specified, e.g. `"atlas.microsoft.com"`, then `https` will be assumed.
         * @memberof SpatialURL
         */
        function SpatialURL(pipeline, mapsUrl) {
            if (mapsUrl === void 0) { mapsUrl = "https://atlas.microsoft.com"; }
            var _this = _super.call(this, pipeline, mapsUrl) || this;
            _this.spatialContext = new Spatial(_this.mapsClientContext);
            return _this;
        }
        /**
         * Returns a FeatureCollection where each Feature is a buffer around the corresponding
         * indexed Feature of the input. The buffer could be either on the outside or the inside of the
         * provided Feature, depending on the distance provided in the input. There must be either one
         * distance provided per Feature in the FeatureCollection  input, or if only one distance is
         * provided, then that distance is applied to every Feature in the collection. The positive (or
         * negative) buffer of a geometry is defined as the Minkowski sum (or difference) of the geometry
         * with a circle of radius equal to the absolute value of the buffer distance. The buffer API
         * always returns a polygonal result. The negative or zero-distance buffer of lines and points is
         * always an empty polygon. The input features are provided in the request or
         * by a GeoJSON file which is uploaded via [Data Upload API](https://docs.microsoft.com/en-us/rest/api/maps/data/uploadPreview)
         * and referenced by a unique udid. The data may contain a collection of Point, MultiPoint,
         * Polygon, MultiPolygon, LineString and MultiLineString. GeometryCollection will be ignored if
         * provided.
         *
         * If directly providing the `FeatureCollection` uses the Post Buffer API: https://docs.microsoft.com/rest/api/maps/spatial/postbuffer
         *
         * Otherwise uses the Get Buffer API: https://docs.microsoft.com/rest/api/maps/spatial/getbuffer
         *
         * @param {Aborter} aborter Create a new Aborter instance with Aborter.none or Aborter.timeout(),
         * goto documents of Aborter for more examples about request cancellation.
         * @param {string | SpatialFeatureCollection} udidOrFeatureCollection
         *  A `FeatureCollection` containing the inputs or the unique id returned from [Data Upload
         * API](https://docs.microsoft.com/en-us/rest/api/maps/data/uploadPreview) after uploading a valid
         * GeoJSON FeatureCollection object.  Please refer to [RFC
         * 7946](https://tools.ietf.org/html/rfc7946#section-3.3) for details. All the feature's properties
         * should contain `geometryId`, which is used for identifying the geometry and is case-sensitive.
         * @param {number[]} distances The list of distances (one per feature or one for all features).
         * Positive distance will generate a buffer outside of the
         * feature, whereas negative distance will generate a buffer inside of the feature. If the negative
         * distance larger than the geometry itself, an empty polygon will be returned.
         * @returns {Promise<GetBufferResponse>}
         * @memberof SpatialURL
         */
        SpatialURL.prototype.getBuffer = function (aborter, udidOrFeatureCollection, distances) {
            return __awaiter(this, void 0, void 0, function () {
                var response, _a, collection;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (distances.length < 1) {
                                throw new Error("At least one distance must be specified");
                            }
                            if (!(typeof udidOrFeatureCollection === "string")) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.spatialContext.getBuffer(udidOrFeatureCollection, distances.join(";"), {
                                    abortSignal: aborter
                                })];
                        case 1:
                            _a = _b.sent();
                            return [3 /*break*/, 4];
                        case 2: return [4 /*yield*/, this.spatialContext.postBuffer({ geometries: udidOrFeatureCollection, distances: distances }, {
                                abortSignal: aborter
                            })];
                        case 3:
                            _a = _b.sent();
                            _b.label = 4;
                        case 4:
                            response = _a;
                            // Add a bbox value here since there is no geojson extension.
                            if (response.result && response.result.features) {
                                collection = response.result;
                                collection.bbox = calculateBoundingBox(collection.features);
                            }
                            return [2 /*return*/, __assign(__assign({}, response), { rawResponse: response._response })];
                    }
                });
            });
        };
        /**
         * Returns the closest point between a base point and a given set of points provided
         * by user data in the request or in a user uploaded data set identified by udid.
         * If using a udid the set of target points is provided by a GeoJSON file
         * which is uploaded via [Data Upload
         * API](https://docs.microsoft.com/en-us/rest/api/maps/data/uploadPreview) and referenced by a
         * unique udid. The GeoJSON file may only contain a collection of Point geometry. MultiPoint or
         * other geometries will be ignored if provided. The maximum number of points accepted is 100,000.
         * The algorithm does not take into account routing or traffic. Information returned includes
         * closest point latitude, longitude, and distance in meters from the closest point.
         *
         * If directly providing the `FeatureCollection` uses the Post Closest Point API: https://docs.microsoft.com/rest/api/maps/spatial/postclosestpoint
         *
         * Otherwise uses the Get Closest Point API: https://docs.microsoft.com/rest/api/maps/spatial/getclosestpoint
         *
         * @param {Aborter} aborter Create a new Aborter instance with Aborter.none or Aborter.timeout(),
         * goto documents of Aborter for more examples about request cancellation.
         * @param {string | SpatialFeatureCollection} udidOrFeatureCollection
         * A `FeatureCollection` containing the target points or the unique id returned from [Data Upload
         * API](https://docs.microsoft.com/en-us/rest/api/maps/data/uploadPreview) after uploading a valid
         * GeoJSON FeatureCollection object.  Please refer to [RFC
         * 7946](https://tools.ietf.org/html/rfc7946#section-3.3) for details. All the feature's properties
         * should contain `geometryId`, which is used for identifying the geometry and is case-sensitive.
         * @param {GeoJSON.Position} position The base point.
         * @param {GetClosestPointOptions} [options] The optional parameters
         * @returns {Promise<GetClosesPointResponse>}
         * @memberof SpatialURL
         */
        SpatialURL.prototype.getClosestPoint = function (aborter, position, udidOrFeatureCollection, options) {
            if (options === void 0) { options = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var lon, lat, response, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (position.length < 2) {
                                throw new Error("The position must contain both longitude " +
                                    "and latitude, e.g. [longitude, latitude]");
                            }
                            lon = position[0], lat = position[1];
                            if (!(typeof udidOrFeatureCollection === "string")) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.spatialContext.getClosestPoint(udidOrFeatureCollection, lat, lon, __assign(__assign({}, options), { abortSignal: aborter }))];
                        case 1:
                            _a = _b.sent();
                            return [3 /*break*/, 4];
                        case 2: return [4 /*yield*/, this.spatialContext.postClosestPoint(lat, lon, udidOrFeatureCollection, __assign(__assign({}, options), { abortSignal: aborter }))];
                        case 3:
                            _a = _b.sent();
                            _b.label = 4;
                        case 4:
                            response = _a;
                            return [2 /*return*/, __assign(__assign({}, response), { rawResponse: response._response, geojson: new ClosestPointGeojson(response) })];
                    }
                });
            });
        };
        /**
         * Retrieves the proximity of a coordinate to a
         * geofence provided in the request or that has been uploaded to the Data service. You can use the
         * [Data Upload API](https://docs.microsoft.com/en-us/rest/api/maps/data/uploadPreview) to upload
         * a geofence or set of fences. See [Geofencing GeoJSON
         * data](https://docs.microsoft.com/en-us/azure/azure-maps/geofence-geojson)
         * for more details on the geofence data format. To query the proximity of a coordinate, you supply
         * the location of the object you are tracking as well
         * as the ID for the fence or set of fences, and the response will contain information about
         * the distance from the outer edge of the geofence. A negative value signifies that the
         * coordinate is inside of the fence while a positive value means that it is outside of the
         * fence. This API can be used for a variety of scenarios that include things like asset
         * tracking, fleet management, or setting up alerts for moving objects.
         *
         * The API supports [integration with Event
         * Grid](https://docs.microsoft.com/azure/azure-maps/azure-maps-event-grid-integration). The
         * isAsync parameter is used to enable integration with Event Grid (disabled by default).
         * To test this API, you can upload the sample data from Post Geofence API examples(Request Body)
         * via Data Upload API and replace the [udid] from the sample request below with the udid returned
         * by Data Upload API.
         *
         * If directly providing the geofence uses the Post Geofence API: https://docs.microsoft.com/rest/api/maps/spatial/postgeofence
         *
         * Otherwise uses the Get Geofence API: https://docs.microsoft.com/en-us/rest/api/maps/spatial/getgeofence
         *
         * ### Geofencing InnerError code
         *
         * In geofencing response error contract, `innererror` is  an object containing service specific
         * information about the error. `code` is a property in `innererror` which can map to a specific
         * geofencing error type. The table belows shows the code mapping between all the known client
         * error type to the corresponding geofencing error `message`.
         *
         * innererror.code | error.message
         * ---------------------------- | --------------------------------------
         * NullDeviceId  | Device Id should not be null.
         * NullUdid	  | Udid should not be null.
         * UdidWrongFormat| Udid should be acquired from user data ingestion API.
         * InvalidUserTime| Usertime is invalid.
         * InvalidSearchBuffer| Searchbuffer is invalid.
         * InvalidSearchRange| The value range of searchbuffer should be from 0 to 500 meters.
         * InvalidLatLon| Lat and/or lon parameters are invalid.
         * InvalidIsAsyncValue| The IsAsync parameter is invalid.
         * InvalidModeValue| The mode parameter invalid.
         * InvalidJson| Geofencing data is not a valid json file.
         * NotSupportedGeoJson| Geofencing data can't be read as a Feature or FeatureCollections.
         * InvalidGeoJson| Geofencing data is invalid.
         * NoUserDataWithAccountOrSubscription| Can't find user geofencing data with provided account-id
         * and/or subscription-id.
         * NoUserDataWithUdid|	Can't find user geofencing data with provided udId.
         * @param {Aborter} aborter Create a new Aborter instance with Aborter.none or Aborter.timeout(),
         * goto documents of Aborter for more examples about request cancellation.
         * @param {string} deviceId ID of the device
         * @param {string | SpatialFeatureCollection} udidOrFeatureCollection
         * A `FeatureCollection` containing the fence or the unique id returned from [Data Upload
         * API](https://docs.microsoft.com/en-us/rest/api/maps/data/uploadPreview) after uploading a valid
         * GeoJSON FeatureCollection object. Please refer to [RFC
         * 7946](https://tools.ietf.org/html/rfc7946#section-3.3) for details. All the feature's
         * properties should contain `geometryId`, which is used for identifying the geometry and is
         * case-sensitive.
         * @param {GeoJSON.Position} position The location being passed.
         * @param {GetGeofenceOptions} [options] The optional parameters
         * @returns {Promise<GetGeofenceResponse>}
         * @memberof SpatialURL
         */
        SpatialURL.prototype.getGeofence = function (aborter, deviceId, udidOrFeatureCollection, position, options) {
            if (options === void 0) { options = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var lon, lat, response, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (position.length < 2) {
                                throw new Error("The position must contain both longitude " +
                                    "and latitude, e.g. [longitude, latitude]");
                            }
                            lon = position[0], lat = position[1];
                            if (!(typeof udidOrFeatureCollection === "string")) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.spatialContext.getGeofence(deviceId, udidOrFeatureCollection, lat, lon, __assign(__assign({}, options), { abortSignal: aborter }))];
                        case 1:
                            _a = _b.sent();
                            return [3 /*break*/, 4];
                        case 2: return [4 /*yield*/, this.spatialContext.postGeofence(deviceId, lat, lon, udidOrFeatureCollection, __assign(__assign({}, options), { abortSignal: aborter }))];
                        case 3:
                            _a = _b.sent();
                            _b.label = 4;
                        case 4:
                            response = _a;
                            return [2 /*return*/, __assign(__assign({}, response), { rawResponse: response._response, geojson: new GeofenceGeojson(response) })];
                    }
                });
            });
        };
        /**
         * Return the great-circle or shortest distance between two points on the surface of
         * a sphere, measured along the surface of the sphere.  This differs from calculating a straight
         * line through the sphere's interior. This method is helpful for estimating travel distances for
         * airplanes by calculating the shortest distance between airports.
         *
         * Uses the Get Great Circle Distance API: https://docs.microsoft.com/rest/api/maps/spatial/getgreatcircledistance
         *
         * @param {Aborter} aborter Create a new Aborter instance with Aborter.none or Aborter.timeout(),
         * goto documents of Aborter for more examples about request cancellation.
         * @param {GeoJSON.Position[]} coordinates The coordinates through which the distance is calculated. Two
         * coordinates are required. The first one is the source point coordinate and the last is the
         * target point coordinate.
         * @returns {Promise<GetGreatCircleDistance>}
         */
        SpatialURL.prototype.getGreatCircleDistance = function (aborter, coordinates) {
            return __awaiter(this, void 0, void 0, function () {
                var query, response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (coordinates.length < 2) {
                                throw new Error("The coordinates must contain at least two positions");
                            }
                            query = coordinates
                                .map(function (coordinate) {
                                if (coordinate.length < 2) {
                                    throw new Error("The coordinate must contain both longitude " +
                                        "and latitude, e.g. [longitude, latitude]");
                                }
                                return coordinate[1] + "," + coordinate[0];
                            })
                                .join(":");
                            return [4 /*yield*/, this.spatialContext.getGreatCircleDistance(query, {
                                    abortSignal: aborter
                                })];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, __assign(__assign({}, response), { rawResponse: response._response })];
                    }
                });
            });
        };
        /**
         * Returns whether a point is inside a set of polygons. The set
         * of polygons is provided in the request or by a GeoJSON file which is uploaded via [Data Upload
         * API](https://docs.microsoft.com/en-us/rest/api/maps/data/uploadPreview) and referenced by a
         * unique udid. The GeoJSON file may contain Polygon and MultiPolygon geometries, other geometries
         * will be ignored if provided. If the point is inside or on the boundary of one of these polygons,
         * the value returned is true. In all other cases, the value returned is false. When the point is
         * inside multiple polygons, the result will give intersecting geometries section to show all valid
         * geometries(referenced by geometryId) in user data. The maximum number of vertices accepted to
         * form a Polygon is 10,000.
         *
         * If directly providing the `FeatureCollection` uses the Post Point In Polygon API: https://docs.microsoft.com/rest/api/maps/spatial/postpointinpolygon
         *
         * Otherwise uses the Get Point In Polygon API: https://docs.microsoft.com/rest/api/maps/spatial/getpointinpolygon
         *
         * @param {Aborter} aborter Create a new Aborter instance with Aborter.none or Aborter.timeout(),
         * goto documents of Aborter for more examples about request cancellation.
         * @param {string | SpatialFeatureCollection} udidOrFeatureCollection
         * A `FeatureCollection` containing the polygons or the unique id returned from [Data Upload
         * API](https://docs.microsoft.com/en-us/rest/api/maps/data/uploadPreview) after uploading a valid
         * GeoJSON FeatureCollection object.  Please refer to [RFC
         * 7946](https://tools.ietf.org/html/rfc7946#section-3.3) for details. All the feature's properties
         * should contain `geometryId`, which is used for identifying the geometry and is case-sensitive.
         * @param {GeoJSON.Position} position The base point.
         * @returns {Promise<GetPointInPolygonResponse>}
         * @memberof SpatialURL
         */
        SpatialURL.prototype.getPointInPolygon = function (aborter, udidOrFeatureCollection, position) {
            return __awaiter(this, void 0, void 0, function () {
                var lon, lat, response, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            if (position.length < 2) {
                                throw new Error("The position must contain both longitude " +
                                    "and latitude, e.g. [longitude, latitude]");
                            }
                            lon = position[0], lat = position[1];
                            if (!(typeof udidOrFeatureCollection === "string")) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.spatialContext.getPointInPolygon(udidOrFeatureCollection, lat, lon, {
                                    abortSignal: aborter
                                })];
                        case 1:
                            _a = _b.sent();
                            return [3 /*break*/, 4];
                        case 2: return [4 /*yield*/, this.spatialContext.postPointInPolygon(lat, lon, udidOrFeatureCollection, {
                                abortSignal: aborter
                            })];
                        case 3:
                            _a = _b.sent();
                            _b.label = 4;
                        case 4:
                            response = _a;
                            return [2 /*return*/, __assign(__assign({}, response), { rawResponse: response._response, geojson: new PointInPolygonGeojson(response) })];
                    }
                });
            });
        };
        return SpatialURL;
    }(MapsURL));

    /**
     * A TimezoneURL represents a URL to the Azure Maps timezone operations.
     *
     * @export
     * @class TimezoneURL
     * @extends {MapsURL}
     */
    var TimezoneURL = /** @class */ (function (_super) {
        __extends(TimezoneURL, _super);
        /**
         * Creates an instance of TimezoneURL.
         * @param {Pipeline} pipeline Call MapsURL.newPipeline() to create a default
         * pipeline, or provide a customized pipeline.
         * @param {string} mapsUrl A URL string pointing to Azure Maps service, default is
         * `"https://atlas.microsoft.com"`.
         * If no protocol is specified, e.g. `"atlas.microsoft.com"`, then `https` will be assumed.
         * @memberof TimezoneURL
         */
        function TimezoneURL(pipeline, mapsUrl) {
            if (mapsUrl === void 0) { mapsUrl = "https://atlas.microsoft.com"; }
            var _this = _super.call(this, pipeline, mapsUrl) || this;
            _this.timezoneContext = new Timezone(_this.mapsClientContext);
            return _this;
        }
        /**
         * This API returns current, historical, and future time zone information for a specified
         * latitude-longitude pair. In addition, the API provides sunset and sunrise times for a given
         * location.
         *
         * Uses the Get Timezone By Coordinates API: https://docs.microsoft.com/rest/api/maps/timezone/gettimezonebycoordinates
         *
         * @param {GeoJSON.Position} coordinate Coordinates of the point for which time zone information is requested. The
         * applicable query is specified as a comma separated string composed by latitude followed by
         * longitude e.g. "47.641268,-122.125679".
         * @param {GetTimezoneByCoordinatesOptions} [options] The optional parameters
         * @returns {Promise<GetTimezoneByCoordinatesResponse>}
         * @memberof TimezoneURL
         */
        TimezoneURL.prototype.getTimezoneByCoordinates = function (aborter, coordinate, options) {
            if (options === void 0) { options = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var query, response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (coordinate.length < 2) {
                                throw new Error("The coordinate must contain both longitude " +
                                    "and latitude, e.g. [longitude, latitude]");
                            }
                            query = coordinate[1] + "," + coordinate[0];
                            return [4 /*yield*/, this.timezoneContext.getTimezoneByCoordinates(query, __assign(__assign({}, options), { abortSignal: aborter }))];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, __assign(__assign({}, response), { rawResponse: response._response })];
                    }
                });
            });
        };
        /**
         * This API returns current, historical, and future time zone information for the specified IANA
         * time zone ID.
         *
         * Uses the Get Timezone By ID API: https://docs.microsoft.com/rest/api/maps/timezone/gettimezonebyid
         *
         * @param {string} id The IANA time zone ID.
         * @param {GetTimezoneByIdOptions} [options] The optional parameters
         * @returns {Promise<GetTimezoneByIdResponse>}
         * @memberof TimezoneURL
         */
        TimezoneURL.prototype.getTimezoneById = function (aborter, id, options) {
            if (options === void 0) { options = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.timezoneContext.getTimezoneByID(id, __assign(__assign({}, options), { abortSignal: aborter }))];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, __assign(__assign({}, response), { rawResponse: response._response })];
                    }
                });
            });
        };
        return TimezoneURL;
    }(MapsURL));

    /**
     * A helper extension providing methods for accessing the response data in GeoJSON format.
     */
    var CarShareGeojson = /** @class */ (function () {
        /**
         * Initializes a new car share geojson helper.
         * @internal
         */
        function CarShareGeojson(response) {
            this.response = response;
        }
        /**
         * Returns a GeoJSON feature collection built from the results.
         * The collection will include one Point feature representing the car share vehicle.
         * The properties of the feature match the properties of the results, except
         * the `position` property is omitted because it is redundant with the feature's coordinates.
         */
        CarShareGeojson.prototype.getFeatures = function () {
            // Include all the properties of the transit object except position.
            // Also delete the _response property.
            var props = __assign({}, this.response);
            delete props.position;
            delete props._response;
            var features = [{
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [
                            this.response.position.longitude,
                            this.response.position.latitude
                        ]
                    },
                    properties: props
                }];
            return {
                type: "FeatureCollection",
                features: features,
                bbox: calculateBoundingBox(features)
            };
        };
        return CarShareGeojson;
    }());

    /**
     * A helper extension providing methods for accessing the response data in GeoJSON format.
     */
    var MetroAreaGeojson = /** @class */ (function () {
        /**
         * Initializes a new metro area geojson helper.
         * @internal
         */
        function MetroAreaGeojson(response) {
            this.response = response;
        }
        /**
         * Returns a GeoJSON feature collection built from the results.
         * Each feature in the collection is a Polygon representing one area.
         * The properties of each feature match the properties of the `MetroAreaResult`, except
         * the `geometry` property is omitted because it is redundant with the feature's geometry.
         */
        MetroAreaGeojson.prototype.getFeatures = function () {
            var features = this.response.results.map(function (result) {
                // Include all the properties of the transit object except position.
                var props = __assign({}, result);
                delete props.geometry;
                return {
                    type: "Feature",
                    geometry: result.geometry,
                    properties: props
                };
            });
            return {
                type: "FeatureCollection",
                features: features,
                bbox: calculateBoundingBox(features)
            };
        };
        return MetroAreaGeojson;
    }());

    /**
     * A helper extension providing methods for accessing the response data in GeoJSON format.
     */
    var NearbyTransitGeojson = /** @class */ (function () {
        /**
         * Initializes a new nearby transit geojson helper.
         * @internal
         */
        function NearbyTransitGeojson(response) {
            this.response = response;
        }
        /**
         * Returns a GeoJSON feature collection built from the results.
         * Each feature in the collection is a Point representing one transit object.
         * The properties of each feature match the properties of the `TransitObjectResult`, except
         * the `position` property is omitted because it is redundant with the feature's coordinates.
         */
        NearbyTransitGeojson.prototype.getFeatures = function () {
            var features = this.response.results.map(function (result) {
                // Include all the properties of the transit object except position.
                var props = __assign({}, result);
                delete props.position;
                return {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [
                            result.position.longitude,
                            result.position.latitude
                        ]
                    },
                    properties: props
                };
            });
            return {
                type: "FeatureCollection",
                features: features,
                bbox: calculateBoundingBox(features)
            };
        };
        return NearbyTransitGeojson;
    }());

    /**
     * A helper extension providing methods for accessing the response data in GeoJSON format.
     */
    var RealTimeArrivalsGeojson = /** @class */ (function () {
        /**
         * Initializes a new real time arrivals geojson helper.
         * @internal
         */
        function RealTimeArrivalsGeojson(response) {
            this.response = response;
        }
        /**
         * Returns a GeoJSON feature collection built from the results.
         * Each feature in the collection is a Point representing one arrival.
         * The properties of each feature match the properties of the `RealTimeArrivalResult`, except
         * the `position` property of the stop is omitted because it is redundant with the feature's coordinates.
         */
        RealTimeArrivalsGeojson.prototype.getFeatures = function () {
            var features = this.response.results.map(function (result) {
                // Include all the properties of the arrival except stop position.
                var props = __assign(__assign({}, result), { stop: __assign({}, result.stop) });
                delete props.stop.position;
                return {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [
                            result.stop.position.longitude,
                            result.stop.position.latitude
                        ]
                    },
                    properties: props
                };
            });
            return {
                type: "FeatureCollection",
                features: features,
                bbox: calculateBoundingBox(features)
            };
        };
        return RealTimeArrivalsGeojson;
    }());

    /**
     * A helper extension providing methods for accessing the response data in GeoJSON format.
     */
    var TransitDockGeojson = /** @class */ (function () {
        /**
         * Initializes a new transit dock geojson helper.
         * @internal
         */
        function TransitDockGeojson(response) {
            this.response = response;
        }
        /**
         * Returns a GeoJSON feature collection built from the results.
         * The collection will include one Point feature representing the dock.
         * The properties of the feature match the properties of the results, except
         * the `position` property is omitted because it is redundant with the feature's coordinates.
         */
        TransitDockGeojson.prototype.getFeatures = function () {
            // Include all the properties of the dock except position.
            // Also delete the _response property.
            var props = __assign({}, this.response);
            delete props.position;
            delete props._response;
            var features = [{
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [
                            this.response.position.longitude,
                            this.response.position.latitude
                        ]
                    },
                    properties: props
                }];
            return {
                type: "FeatureCollection",
                features: features,
                bbox: calculateBoundingBox(features)
            };
        };
        return TransitDockGeojson;
    }());

    /**
     * A helper extension providing methods for accessing the response data in GeoJSON format.
     */
    var TransitItineraryGeojson = /** @class */ (function () {
        /**
         * Initializes a new transit itinerary geojson helper.
         * @internal
         */
        function TransitItineraryGeojson(response) {
            this.response = response;
        }
        /**
         * Returns a GeoJSON feature collection built from the itinerary.
         * Each feature in the collection is a `LineString` representing one leg of the itinerary.
         * Legs which don't specify start and end positions will be omitted from the collection,
         * e.g. `"Wait"` or sometimes `"PathWayWalk"`.
         * If geometry details were requested the LineStrings will follow those geometries.
         * If geometry details were not requested the LineStrings will directly connect the start and end points of the leg.
         * The properties of each feature match the properties of the `Leg`, except
         * the `geometry`, `origin`, and `destination` properties is omitted
         * because they are redundant with the feature's coordinates.
         */
        TransitItineraryGeojson.prototype.getFeatures = function () {
            var features = this.response.legs
                .filter(function (leg) { return leg.legType !== LegType.Wait; })
                .filter(function (leg) { return leg.geometry || (leg.origin && leg.destination) || leg.stops; })
                .map(function (leg) {
                var coords;
                if (leg.geometry) {
                    coords = leg.geometry.coordinates;
                }
                else if (leg.origin && leg.destination) {
                    coords = [
                        [leg.origin.position.longitude, leg.origin.position.latitude],
                        [leg.destination.position.longitude, leg.destination.position.latitude]
                    ];
                }
                else if (leg.stops) {
                    var start = leg.stops[0];
                    var end = leg.stops[leg.stops.length - 1];
                    coords = [
                        [start.position.longitude, start.position.latitude],
                        [end.position.longitude, end.position.latitude]
                    ];
                }
                // Include all properties on the leg except geometry, origin, and destination.
                var props = __assign({}, leg);
                delete props.geometry;
                delete props.origin;
                delete props.destination;
                return {
                    type: "Feature",
                    geometry: {
                        type: "LineString",
                        coordinates: coords
                    },
                    properties: props
                };
            });
            return {
                type: "FeatureCollection",
                features: features,
                bbox: calculateBoundingBox(features)
            };
        };
        return TransitItineraryGeojson;
    }());

    /**
     * A helper extension providing methods for accessing the response data in GeoJSON format.
     */
    var TransitLineGeojson = /** @class */ (function () {
        /**
         * Initializes a new transit line geojson helper.
         * @internal
         */
        function TransitLineGeojson(response) {
            this.response = response;
        }
        /**
         * Returns a GeoJSON feature collection built from the results.
         * If stop details were requested the collection will contain `Point` features representing each stop.
         * If pattern details were requested the collection will contain `LineString` features representing each pattern.
         * Features representing stops will have properties matching the `Stop`, except `position` will be omitted.
         * Features representing patterns will have properties matching the `Pattern`, except geometry will be omitted.
         */
        TransitLineGeojson.prototype.getFeatures = function () {
            var features = [];
            if (this.response.patterns) {
                for (var _i = 0, _a = this.response.patterns; _i < _a.length; _i++) {
                    var pattern = _a[_i];
                    // Include all properties on the pattern except geometry.
                    var props = __assign({}, pattern);
                    delete props.geometry;
                    features.push({
                        type: "Feature",
                        geometry: pattern.geometry,
                        properties: props
                    });
                }
            }
            if (this.response.stops) {
                for (var _b = 0, _c = this.response.stops; _b < _c.length; _b++) {
                    var stop_1 = _c[_b];
                    // Include all properties on the stop except position.
                    var props = __assign({}, stop_1);
                    delete props.position;
                    features.push({
                        type: "Feature",
                        geometry: {
                            type: "Point",
                            coordinates: [
                                stop_1.position.longitude,
                                stop_1.position.latitude
                            ]
                        },
                        properties: props
                    });
                }
            }
            return {
                type: "FeatureCollection",
                features: features,
                bbox: calculateBoundingBox(features)
            };
        };
        return TransitLineGeojson;
    }());

    /**
     * A helper extension providing methods for accessing the response data in GeoJSON format.
     */
    var TransitStopGeojson = /** @class */ (function () {
        /**
         * Initializes a new transit stop geojson helper.
         * @internal
         */
        function TransitStopGeojson(response) {
            this.response = response;
        }
        /**
         * Returns a GeoJSON feature collection built from the results.
         * The collection will include one Point feature representing the `Stop`.
         * The properties of the feature match the properties of the results, except
         * the `position` property of the stop is omitted because it is redundant with the feature's coordinates.
         */
        TransitStopGeojson.prototype.getFeatures = function () {
            // Include all the properties of the stop except position.
            // Also delete the _response property.
            var props = __assign(__assign({}, this.response), { stop: __assign({}, this.response.stop) });
            delete props.stop.position;
            delete props._response;
            var features = [{
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [
                            this.response.stop.position.longitude,
                            this.response.stop.position.latitude
                        ]
                    },
                    properties: props
                }];
            return {
                type: "FeatureCollection",
                features: features,
                bbox: calculateBoundingBox(features)
            };
        };
        return TransitStopGeojson;
    }());

    /**
     * A MobilityURL represents a URL to the Azure Maps mobility operations.
     *
     * @export
     * @class MobilityURL
     * @extends {MapsURL}
     */
    var MobilityURL = /** @class */ (function (_super) {
        __extends(MobilityURL, _super);
        /**
         * Creates an instance of MobilityURL.
         * @param {Pipeline} pipeline Call MapsURL.newPipeline() to create a default
         * pipeline, or provide a customized pipeline.
         * @param {string} mapsUrl A URL string pointing to Azure Maps service, default is
         * `"https://atlas.microsoft.com"`.
         * If no protocol is specified, e.g. `"atlas.microsoft.com"`, then `https` will be assumed.
         * @memberof MobilityURL
         */
        function MobilityURL(pipeline, mapsUrl) {
            if (mapsUrl === void 0) { mapsUrl = "https://atlas.microsoft.com"; }
            var _this = _super.call(this, pipeline, mapsUrl) || this;
            _this.mobilityContext = new Mobility(_this.mapsClientContext);
            return _this;
        }
        /**
         * **Note: This API is currently in preview and may be subject to breaking changes.**
         * Requests static and real-time information for a given car share vehicle.
         * Response contains details such as availability and vacancy information and operator details. The
         * service supplements [Nearby Transit API](https://aka.ms/AzureMapsMobilityNearbyTransit).
         *
         * Uses the Get Car Share Info API: https://docs.microsoft.com/rest/api/maps/mobility/getcarshareinfopreview
         *
         * @param {Aborter} aborter Create a new Aborter instance with Aborter.none or Aborter.timeout(),
         * goto documents of Aborter for more examples about request cancellation.
         * @param {string} query vehicleId. The unique identifier of the car share vehicle. For example,
         * "29B8C4AFC062D681E050007F01004F07". Can be requested by using [Nearby Transit
         * API](https://aka.ms/AzureMapsMobilityNearbyTransit).
         * @param {GetCarShareInfoOptions} [options] The optional parameters
         * @returns {Promise<GetCarShareInfoResponse>}
         * @memberof MobilityURL
         */
        MobilityURL.prototype.getCarShareInfo = function (aborter, query, options) {
            if (options === void 0) { options = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            // Decode the input vehicleId as it is provided to the user already encoded.
                            query = decodeURIComponent(query);
                            return [4 /*yield*/, this.mobilityContext.getCarShareInfoPreview(query, __assign(__assign({}, options), { abortSignal: aborter }))];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, __assign(__assign({}, response), { rawResponse: response._response, geojson: new CarShareGeojson(response) })];
                    }
                });
            });
        };
        /**
         * **Note: This API is currently in preview and may be subject to breaking changes.**
         * Request metro areas in which the Azure Maps Mobility Service is available. The
         * service supports filtering results by country or coordinate location. Information returned
         * includes Metro Area  details such as metro Id, name and a representation of the metro area
         * geometry in GeoJSON format.
         *
         * Uses the Get Metro Area API: https://docs.microsoft.com/rest/api/maps/mobility/getmetroareapreview
         *
         * @param {Aborter} aborter Create a new Aborter instance with Aborter.none or Aborter.timeout(),
         * goto documents of Aborter for more examples about request cancellation.
         * @param {GeoJSON.Position | string} query The applicable location input. Can be a GeoJSON position or countryCode
         * (2-character ISO country code).
         * @param {GetMetroAreaOptions} [options] The optional parameters
         * @returns {Promise<GetMetroAreaResponse>}
         * @memberof MobilityURL
         */
        MobilityURL.prototype.getMetroArea = function (aborter, query, options) {
            if (options === void 0) { options = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (Array.isArray(query) && query.length < 2) {
                                throw new Error("The query must contain both longitude " +
                                    "and latitude, e.g. [longitude, latitude]");
                            }
                            query = typeof query === "string" ? query : query[1] + "," + query[0];
                            return [4 /*yield*/, this.mobilityContext.getMetroAreaPreview(query, __assign(__assign({}, options), { abortSignal: aborter }))];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, __assign(__assign({}, response), { rawResponse: response._response, geojson: new MetroAreaGeojson(response) })];
                    }
                });
            });
        };
        /**
         * **Note: This API is currently in preview and may be subject to breaking changes.**
         * Request additional information for metro areas in which the Azure Maps
         * Mobility Service is available. Information such as supported transit types, transit agencies and
         * active alerts is available, depending on the options selected.
         *
         * Uses the Get Metro Area Info API: https://docs.microsoft.com/rest/api/maps/mobility/getmetroareainfopreview
         *
         * @param {Aborter} aborter Create a new Aborter instance with Aborter.none or Aborter.timeout(),
         * goto documents of Aborter for more examples about request cancellation.
         * @param {number} query metroId. The unique id of the metro area. Required parameter specifying the
         * required metro area to search in. Can be retrieved via [Get Metro Area
         * API](https://aka.ms/AzureMapsMobilityTransitRoute).
         * @param {Models.MetroAreaDetailType} detailType Specify details requested respective to the metro area as a comma separated
         * list.
         * @param {GetMetroAreaInfoOptions} [options] The optional parameters
         * @returns {Promise<GetMetroAreaInfoResponse>}
         * @memberof MobilityURL
         */
        MobilityURL.prototype.getMetroAreaInfo = function (aborter, query, detailType, options) {
            if (options === void 0) { options = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.mobilityContext.getMetroAreaInfoPreview(query, detailType, __assign(__assign({}, options), { abortSignal: aborter }))];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, __assign(__assign({}, response), { rawResponse: response._response })];
                    }
                });
            });
        };
        /**
         * **Note: This API is currently in preview and may be subject to breaking changes.**
         * Searches transit objects, for example, public transit
         * stops ans shared bikes around a given location  returning the transit object details. Service
         * allows users to search for specific object types and within a given radius returning a set of
         * transit object with object details. Additional  information such as transit operator information
         * is returned depending on the options selected. The returned information can be used for further
         * processing such as requesting [real-time
         * arrivals](https://aka.ms/AzureMapsMobilityRealTimeArrivals) for the stop or [transit stop
         * details](https://aka.ms/AzureMapsMobilityTransitStop) such as main transit type of most lines
         * stopping for a given public, active service alerts or main transport agency.
         *
         * Uses the Get Nearby Transit API: https://docs.microsoft.com/rest/api/maps/mobility/getnearbytransitpreview
         *
         * @param {Aborter} aborter Create a new Aborter instance with Aborter.none or Aborter.timeout(),
         * goto documents of Aborter for more examples about request cancellation.
         * @param {number} metroId The unique id of the metro area. Required parameter specifying the required metro
         * area to search in. Can be retrieved via [Get Metro Area
         * API](https://aka.ms/AzureMapsMobilityMetro).
         * @param {GeoJSON.Position} location Location input from user.
         * @param {GetNearbyTransitOptions} [options] The optional parameters
         * @returns {Promise<GetNearbyTransitResponse>}
         * @memberof MobilityURL
         */
        MobilityURL.prototype.getNearbyTransit = function (aborter, metroId, location, options) {
            if (options === void 0) { options = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var query, response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (location.length < 2) {
                                throw new Error("The location must contain both longitude " +
                                    "and latitude, e.g. [longitude, latitude]");
                            }
                            query = location[1] + "," + location[0];
                            return [4 /*yield*/, this.mobilityContext.getNearbyTransitPreview(metroId, query, __assign(__assign({}, options), { abortSignal: aborter }))];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, __assign(__assign({}, response), { rawResponse: response._response, geojson: new NearbyTransitGeojson(response) })];
                    }
                });
            });
        };
        /**
         * **Note: This API is currently in preview and may be subject to breaking changes.**
         * Returns for a given a stop, line or location the requested number of
         * real-time arrivals. Endpoint support different modes to request real-time arrivals such as
         * number of live arrivals for all lines arriving at the specified stop or all arrivals of a line
         * to stops near the user’s location. The API supports parameters to request one or multiple public
         * transit types such as bus, tram and subway, maximum number if arrivals, and prefer a specific
         * transit agency operating in the area. In some cases real-time arrivals may not be available, for
         * example, if arrival is too far in the future or transit vehicle does not have capability to
         * share the real-time location. This is symbolized in a scheduleType field present in all
         * responses.
         *
         * Uses Get Real Time Arrivals API: https://docs.microsoft.com/rest/api/maps/mobility/getrealtimearrivalspreview
         *
         * @param {Aborter} aborter Create a new Aborter instance with Aborter.none or Aborter.timeout(),
         * goto documents of Aborter for more examples about request cancellation.
         * @param {number} metroId The unique id of the metro area. Required parameter specifying the required metro
         * area to search in. Can be retrieved via [Get Metro Area
         * API](https://aka.ms/AzureMapsMobilityMetro).
         * @param {string | string[] | GeoJSON.Position} query Stop, line or location identifier.
         * For stop queries a `string` or `string[]` of stop IDs can be provided.
         * For line queries a `string` of the line ID can be provided.
         * For line and stop queries a `string[]` of `["lineId", "stopId"]` can be provided.
         * For position queries a `GeoJSON.Position` can be provided.
         * @param {GetRealTimeArrivalsOptions} [options] The optional parameters
         * @returns {Promise<GetRealTimeArrivalsResponse>}
         * @memberof MobilityURL
         */
        MobilityURL.prototype.getRealTimeArrivals = function (aborter, metroId, query, options) {
            if (options === void 0) { options = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (Array.isArray(query)) {
                                if (query.length === 0) {
                                    throw new Error("The specified query array must contain at least one element");
                                }
                                if (typeof query[0] === "number") {
                                    query = query[1] + "," + query[0];
                                }
                                else {
                                    query = query.join(",");
                                }
                            }
                            query = decodeURIComponent(query);
                            return [4 /*yield*/, this.mobilityContext.getRealTimeArrivalsPreview(metroId, query, __assign(__assign({}, options), { abortSignal: aborter }))];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, __assign(__assign({}, response), { rawResponse: response._response, geojson: new RealTimeArrivalsGeojson(response) })];
                    }
                });
            });
        };
        /**
         * **Note: This API is currently in preview and may be subject to breaking changes.**
         * Request static and real-time information for a given bike or
         * scooter docking station. Response includes availability and vacancy information and operator
         * details. The service supplements [Nearby Transit
         * API](https://aka.ms/AzureMapsMobilityNearbyTransit) that allows you to search nearby bike and
         * scooter docking stations.
         *
         * Uses the Get Transit Dock Info API: https://docs.microsoft.com/rest/api/maps/mobility/gettransitdockinfopreview
         *
         * @param {Aborter} aborter Create a new Aborter instance with Aborter.none or Aborter.timeout(),
         * goto documents of Aborter for more examples about request cancellation.
         * @param {string} query dockId. Required parameter specifying the docking station to search for. Can be
         * retrieved via [Get Nearby Transit API](https://aka.ms/AzureMapsMobilityNearbyTransit).
         * @param {GetTransitDockInfoOptions} [options] The optional parameters
         * @returns {Promise<GetTransitDockInfoResponse>}
         * @memberof MobilityURL
         */
        MobilityURL.prototype.getTransitDockInfo = function (aborter, query, options) {
            if (options === void 0) { options = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            query = decodeURIComponent(query);
                            return [4 /*yield*/, this.mobilityContext.getTransitDockInfoPreview(query, __assign(__assign({}, options), { abortSignal: aborter }))];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, __assign(__assign({}, response), { rawResponse: response._response, geojson: new TransitDockGeojson(response) })];
                    }
                });
            });
        };
        /**
         * **Note: This API is currently in preview and may be subject to breaking changes.**
         * Returns data according to an itinerary Id previously returned by [Transit Route
         * API](https://aka.ms/AzureMapsMobilityTransitRoute). The basic info contains data as to the
         * various legs comprising  the itinerary, including the locations, public transit lines, start and
         * end times. User can request additional routing information such as the  shape of the itinerary
         * and detailed itinerary schedules is also available, depending on the options selected. An
         * itinerary is available up to 24  hours following a search request.
         *
         * Uses the Get Transit Itinerary API: https://docs.microsoft.com/rest/api/maps/mobility/gettransititinerarypreview
         *
         * @param {Aborter} aborter Create a new Aborter instance with Aborter.none or Aborter.timeout(),
         * goto documents of Aborter for more examples about request cancellation.
         * @param {string} query The unique id (itineraryId) of an itinerary previously returned by [Transit Route
         * API](https://aka.ms/AzureMapsMobilityTransitRoute).
         * @param {GetTransitItineraryOptions} [options] The optional parameters
         * @returns {Promise<GetTransitItineraryResponse>}
         * @memberof MobilityURL
         */
        MobilityURL.prototype.getTransitItinerary = function (aborter, query, options) {
            if (options === void 0) { options = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            query = decodeURIComponent(query);
                            return [4 /*yield*/, this.mobilityContext.getTransitItineraryPreview(query, __assign(__assign({}, options), { abortSignal: aborter }))];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, __assign(__assign({}, response), { rawResponse: response._response, geojson: new TransitItineraryGeojson(response) })];
                    }
                });
            });
        };
        /**
         * **Note: This API is currently in preview and may be subject to breaking changes.**
         * Request line group by line group id returning
         * a line group comprised a set of lines.  Additional information such  as 24 hours static
         * schedule, active alerts for the line group and line patterns is also available, depending on the
         * options  selected. Mobility services uses a parallel data model for public transit lines and
         * line groups. Usually line group contains  2 lines, one going from A to B, and the other
         * returning from B to A, both operating by the same Public Transport Agency having  the same line
         * number. We recommend you review our guidance
         * [article](https://aka.ms/AMapsPublicTRansitConcepts) to understand  the concepts of lines and
         * line groups.
         *
         * Uses the Get Transit Line Info API: https://docs.microsoft.com/rest/api/maps/mobility/gettransitlineinfopreview
         *
         * @param {Aborter} aborter Create a new Aborter instance with Aborter.none or Aborter.timeout(),
         * goto documents of Aborter for more examples about request cancellation.
         * @param {number} metroId The unique id of the metro area. Required parameter specifying the required metro
         * area to search in. Can be retrieved via [Get Metro Area
         * API](https://aka.ms/AzureMapsMobilityMetro).
         * @param {string} query lineGroupId, for example,'666074'. Typically contains 2 lines having the same
         * agency and line, one going from A to B, and the other from B to A.
         * @param {GetTransitLineInfoOptions} [options] The optional parameters
         * @returns {Promise<GetTransitLineInfoResponse>}
         * @memberof MobilityURL
         */
        MobilityURL.prototype.getTransitLineInfo = function (aborter, metroId, query, options) {
            if (options === void 0) { options = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            query = decodeURIComponent(query);
                            return [4 /*yield*/, this.mobilityContext.getTransitLineInfoPreview(metroId, query, __assign(__assign({}, options), { abortSignal: aborter }))];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, __assign(__assign({}, response), { rawResponse: response._response, geojson: new TransitLineGeojson(response) })];
                    }
                });
            });
        };
        /**
         * **Note: This API is currently in preview and may be subject to breaking changes.**
         * Allow trip planning returning the best possible route options between
         * an origin and destination by using multi-modal search. Service provides a variety of travel
         * modes, including walk, bike, and public transit.  The API supports parameters to request one or
         * multiple public transit types such as bus, tram and subway, and focus on certain types of bikes,
         * and prefer a specific transit agency operating in the area. Also, service provides options to
         * choose optimal route with least walk or transfers and specify arrival or departure times when
         * user need to be at a specific destination by a certain time.
         *
         * Uses the Get Transit Route API: https://docs.microsoft.com/rest/api/maps/mobility/gettransitroutepreview
         *
         * @param {Aborter} aborter Create a new Aborter instance with Aborter.none or Aborter.timeout(),
         * goto documents of Aborter for more examples about request cancellation.
         * @param {number} metroId The unique id of the metro area. Required parameter specifying the required metro
         * area to search in. Can be retrieved via [Get Metro Area
         * API](https://aka.ms/AzureMapsMobilityMetro).
         * @param {string | GeoJSON.Position} origin The origin of the route.
         * If originType=position a `GeoJSON.Position` should be specified.
         * Otherwise, a `string` should be specified.
         * @param {string | GeoJSON.Position} destination The destination of the route.
         * If destinationType=position a `GeoJSON.Position` should be specified.
         * Otherwise, a `string` should be specified.
         * @param {GetNearbyTransitOptions} [options] The optional parameters
         * @returns {Promise<GetTransitRouteResponse>}
         * @memberof MobilityURL
         */
        MobilityURL.prototype.getTransitRoute = function (aborter, metroId, origin, destination, options) {
            if (options === void 0) { options = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (Array.isArray(origin)) {
                                if (origin.length < 2) {
                                    throw new Error("The origin must contain both longitude " +
                                        "and latitude, e.g. [longitude, latitude]");
                                }
                                origin = origin[1] + "," + origin[0];
                            }
                            if (Array.isArray(destination)) {
                                if (destination.length < 2) {
                                    throw new Error("The destination must contain both longitude " +
                                        "and latitude, e.g. [longitude, latitude]");
                                }
                                destination = destination[1] + "," + destination[0];
                            }
                            origin = decodeURIComponent(origin);
                            destination = decodeURIComponent(destination);
                            return [4 /*yield*/, this.mobilityContext.getTransitRoutePreview(metroId, origin, destination, __assign(__assign({}, options), { abortSignal: aborter }))];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, __assign(__assign({}, response), { rawResponse: response._response })];
                    }
                });
            });
        };
        /**
         * **Note: This API is currently in preview and may be subject to breaking changes.**
         * Requests information for a given public transit stop.
         * Basic information returned includes  details such as main transit type of most lines stopping
         * for a given public and main transport agency. Additional details such as stop  lines, active
         * service alerts for specified stop, photos and user reviews are also available, depending on the
         * options selected.
         *
         * Uses the Get Transit Stop Info API: https://docs.microsoft.com/rest/api/maps/mobility/gettransitstopinfopreview
         *
         * @param {Aborter} aborter Create a new Aborter instance with Aborter.none or Aborter.timeout(),
         * goto documents of Aborter for more examples about request cancellation.
         * @param {number} metroId The unique id of the metro area. Required parameter specifying the required metro
         * area to search in. Can be retrieved via [Get Metro Area
         * API](https://aka.ms/AzureMapsMobilityMetro).
         * @param {string} query The stopId or stopKey for which the user is requesting transit stop details.
         * @param {GetTransitStopInfoOptions} [options] The optional parameters
         * @returns {Promise<GetTransitStopInfoResponse>}
         * @memberof MobilityURL
         */
        MobilityURL.prototype.getTransitStopInfo = function (aborter, metroId, query, options) {
            if (options === void 0) { options = {}; }
            return __awaiter(this, void 0, void 0, function () {
                var response;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            query = decodeURIComponent(query);
                            return [4 /*yield*/, this.mobilityContext.getTransitStopInfoPreview(metroId, query, __assign(__assign({}, options), { abortSignal: aborter }))];
                        case 1:
                            response = _a.sent();
                            return [2 /*return*/, __assign(__assign({}, response), { rawResponse: response._response, geojson: new TransitStopGeojson(response) })];
                    }
                });
            });
        };
        return MobilityURL;
    }(MapsURL));

    // Polyfill string.startsWith for IE11.
    if (!String.prototype.startsWith) {
        Object.defineProperty(String.prototype, "startsWith", {
            value: function (search, pos) {
                return this.substring(!pos || pos < 0 ? 0 : +pos, search.length) === search;
            }
        });
    }

    exports.Aborter = Aborter;
    exports.BaseRequestPolicy = BaseRequestPolicy;
    exports.Credential = Credential;
    exports.CredentialPolicy = CredentialPolicy;
    exports.HttpHeaders = HttpHeaders;
    exports.LoggingPolicyFactory = LoggingPolicyFactory;
    exports.MapControlCredential = MapControlCredential;
    exports.MapControlCredentialPolicy = MapControlCredentialPolicy;
    exports.MapsURL = MapsURL;
    exports.MobilityURL = MobilityURL;
    exports.Models = index;
    exports.Pipeline = Pipeline;
    exports.RenderURL = RenderURL;
    exports.RequestPolicyOptions = RequestPolicyOptions;
    exports.RestError = RestError;
    exports.RetryPolicyFactory = RetryPolicyFactory;
    exports.RouteURL = RouteURL;
    exports.SearchURL = SearchURL;
    exports.SpatialURL = SpatialURL;
    exports.SubscriptionKeyCredential = SubscriptionKeyCredential;
    exports.SubscriptionKeyCredentialPolicy = SubscriptionKeyCredentialPolicy;
    exports.TimezoneURL = TimezoneURL;
    exports.TokenCredential = TokenCredential;
    exports.TokenCredentialPolicy = TokenCredentialPolicy;
    exports.WebResource = WebResource;
    exports.deserializationPolicy = deserializationPolicy;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
