'use strict';


describe('GoogleAnalyticsWebTester Module', function () {
    var module;
    var mockBrowserDriver;

    var defaultSettings = {
        usesGACalls: false,
        usesGTMCalls: true,
        submitToGA: false
    };

    var customSettings = {
        usesGACalls:!defaultSettings.usesGACalls,
        usesGTMCalls: !defaultSettings.usesGTMCalls,
        submitToGA: !defaultSettings.submitToGA
    };


    beforeEach(function () {
        module = window.GoogleAnalyticsWebTester;

        spyOn(module, 'initialize').and.callThrough();
        spyOn(module, 'loadConfigurationSettings').and.callThrough();
        spyOn(module, 'registerBrowserDriverUtilities').and.callThrough();
        spyOn(module, 'registerGoogleAnalyticsEventDataInterceptor').and.callThrough();
        spyOn(module, 'registerGoogleAnalyticsEventDataInterceptorCleanup').and.callThrough();

        // Mock for Protractor's "browser.driver":
        mockBrowserDriver = {};
        mockBrowserDriver._executeScriptCallback = undefined;
        mockBrowserDriver.executeScript = function (callback) {
            mockBrowserDriver._executeScriptCallback = callback;
        };
        mockBrowserDriver.registerGoogleAnalyticsEventDataInterceptor = undefined;
        mockBrowserDriver.unregisterGoogleAnalyticsEventDataInterceptor = undefined;

        spyOn(mockBrowserDriver, 'executeScript').and.callThrough();
    });


    describe('The Module interface', function () {
        it('exposes the "initialize" method', function () {
            expect( module.initialize ).toBeDefined();
        });

        it('exposes the "loadConfigurationSettings" method', function () {
            expect( module.loadConfigurationSettings ).toBeDefined();
        });

        it('exposes the "registerBrowserDriverUtilities" method', function () {
            expect( module.registerBrowserDriverUtilities ).toBeDefined();
        });

        it('exposes the "registerGoogleAnalyticsEventDataInterceptor" method', function () {
            expect( module.registerGoogleAnalyticsEventDataInterceptor ).toBeDefined();
        });

        it('exposes the "registerGoogleAnalyticsEventDataInterceptorCleanup" method', function () {
            expect( module.registerGoogleAnalyticsEventDataInterceptorCleanup ).toBeDefined();
        });
    });


    describe('The behavior of the "loadConfigurationSettings" method', function () {
        it('returns the default settings when called without parameter', function () {
            var settings = module.loadConfigurationSettings();

            expect( settings ).toEqual( defaultSettings );
        });

        it('returns the default settings when called with blank parameter', function () {
            var settings = module.loadConfigurationSettings({
                GoogleAnalyticsWebTester: {}
            });

            expect( settings ).toEqual( defaultSettings );
        });

        it('returns the expected settings when called with parameter', function () {
            var settings = module.loadConfigurationSettings({
                GoogleAnalyticsWebTester: customSettings
            });

            expect( settings ).toEqual( customSettings );
        });
    });


    describe('The behavior of the "initialize" method', function () {
        describe('Expected parameters', function () {
            beforeEach(function () {
                module.initialize({
                    browserParams: {},
                    browserDriver: {}
                });
            });

            it('calls the "loadConfigurationSettings" method', function () {
                expect( module.loadConfigurationSettings ).toHaveBeenCalled();
            });

            it('calls the "registerBrowserDriverUtilities" method', function () {
                expect( module.registerBrowserDriverUtilities ).toHaveBeenCalled();
            });
        });

        describe('Missing parameters', function () {
            beforeEach(function () {
                module.initialize({
                    //browserParams: {},
                    browserDriver: {}
                });
            });

            it('calls the "loadConfigurationSettings" method', function () {
                expect( module.loadConfigurationSettings ).toHaveBeenCalled();
            });
        });
    });


    describe('The behavior of the "registerBrowserDriverUtilities" method', function () {
        beforeEach(function () {
            module.initialize({
                browserParams: {},
                browserDriver: {}
            });
        });

        it('calls the "registerGoogleAnalyticsEventDataInterceptor" method', function () {
            expect( module.registerGoogleAnalyticsEventDataInterceptor ).toHaveBeenCalled();
        });

        it('calls the "registerGoogleAnalyticsEventDataInterceptorCleanup" method', function () {
            expect( module.registerGoogleAnalyticsEventDataInterceptorCleanup ).toHaveBeenCalled();
        });
    });


    describe('The behavior of the "registerGoogleAnalyticsEventDataInterceptor" method', function () {
        describe('Execution with methods not yet defined', function () {
            beforeEach(function () {
                module.registerGoogleAnalyticsEventDataInterceptor(mockBrowserDriver, defaultSettings);
            });

            it('calls the "registerGoogleAnalyticsEventDataInterceptor" method', function () {
                expect( module.registerGoogleAnalyticsEventDataInterceptor ).toHaveBeenCalled();
            });

            it('calls the "browserDriver.executeScript" method', function () {
                mockBrowserDriver.registerGoogleAnalyticsEventDataInterceptor();

                expect( mockBrowserDriver.registerGoogleAnalyticsEventDataInterceptor ).toBeDefined();
            });

            it('registers an the "executeScriptCallback" method', function () {
                mockBrowserDriver.registerGoogleAnalyticsEventDataInterceptor();

                expect( mockBrowserDriver._executeScriptCallback ).toBeDefined();

                mockBrowserDriver._executeScriptCallback();
            });


            describe('The "executeScriptCallback"', function () {
                it('reads the given arguments', function () {
                    mockBrowserDriver.registerGoogleAnalyticsEventDataInterceptor();
                    mockBrowserDriver._executeScriptCallback(true);
                });

                it('overrides "window.ga" if it is defined', function () {
                    mockBrowserDriver.registerGoogleAnalyticsEventDataInterceptor();
                    mockBrowserDriver._executeScriptCallback(true);

                    window.ga();
                });

                describe('The call to "ga()"', function () {
                    beforeEach(function () {
                        window.ga('value1', 'value2');
                    });

                    it('sets the "window.gaEventDataBuffer" variable', function () {
                        var eventBuffer = [
                            window.gaEventDataBuffer[1][0],
                            window.gaEventDataBuffer[1][1]
                        ];

                        expect( eventBuffer ).toEqual(['value1', 'value2']);
                    });
                });
            });
        });

        describe('Execution with methods already defined', function () {
            beforeEach(function () {
                module.registerGoogleAnalyticsEventDataInterceptor({
                    registerGoogleAnalyticsEventDataInterceptor: function () {},
                    unregisterGoogleAnalyticsEventDataInterceptor: function () {}
                }, defaultSettings);
            });

            it('calls the "registerGoogleAnalyticsEventDataInterceptor" method', function () {
                expect( module.registerGoogleAnalyticsEventDataInterceptor ).toHaveBeenCalled();
            });
        });
    });


    describe('The behavior of the "registerGoogleAnalyticsEventDataInterceptor" method, with "window.ga()" defined', function () {
        describe('Execution with methods not yet defined', function () {
            it('saves "window.ga()" as "window.gaOriginal()"', function () {
                window.ga = function () {};
                window.gaEventDataBuffer = undefined;
                window.gaLastEventData = undefined;
                window.gaOriginal = function () {};

                var mockDriver_ = {
                    _executeScriptCallback: undefined,
                    registerGoogleAnalyticsEventDataInterceptor: undefined
                };
                mockDriver_.executeScript = function (callback) {
                    mockDriver_._executeScriptCallback = callback;
                };
                module.registerGoogleAnalyticsEventDataInterceptor(mockDriver_, defaultSettings);
                mockDriver_.registerGoogleAnalyticsEventDataInterceptor();
                mockDriver_._executeScriptCallback(true);

                expect( window.gaOriginal ).toBeDefined();

                window.ga();
            });
        });
    });


    describe('The behavior of the "registerGoogleAnalyticsEventDataInterceptorCleanup" method', function () {
        describe('Execution with methods not yet defined', function () {
            beforeEach(function () {
                module.registerGoogleAnalyticsEventDataInterceptorCleanup(mockBrowserDriver, defaultSettings);
            });

            it('calls the "registerGoogleAnalyticsEventDataInterceptorCleanup" method', function () {
                expect( module.registerGoogleAnalyticsEventDataInterceptorCleanup ).toHaveBeenCalled();
            });

            it('calls the "browserDriver.executeScript" method', function () {
                mockBrowserDriver.unregisterGoogleAnalyticsEventDataInterceptor ();

                expect( mockBrowserDriver.unregisterGoogleAnalyticsEventDataInterceptor ).toBeDefined();
            });

            it('registers an the "executeScriptCallback" method', function () {
                mockBrowserDriver.unregisterGoogleAnalyticsEventDataInterceptor();

                expect( mockBrowserDriver._executeScriptCallback ).toBeDefined();

                mockBrowserDriver._executeScriptCallback();
            });
        });

        describe('Execution with methods already defined', function () {
            beforeEach(function () {
                module.registerGoogleAnalyticsEventDataInterceptorCleanup({
                    registerGoogleAnalyticsEventDataInterceptor: function () {},
                    unregisterGoogleAnalyticsEventDataInterceptor: function () {}
                }, defaultSettings);
            });

            it('calls the "registerGoogleAnalyticsEventDataInterceptorCleanup" method', function () {
                expect( module.registerGoogleAnalyticsEventDataInterceptorCleanup ).toHaveBeenCalled();
            });
        });
    });
});
