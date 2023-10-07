"use strict";
var Util;
(function (Util) {
    ;
    function DistanceComparator(aOrigin) {
        return (aPosition1, aPosition2) => {
            const lDeltaX1 = aPosition1.mX - aOrigin.mX;
            const lDeltaY1 = aPosition1.mY - aOrigin.mY;
            const lDeltaX2 = aPosition2.mX - aOrigin.mX;
            const lDeltaY2 = aPosition2.mY - aOrigin.mY;
            const lDistanceSquared1 = lDeltaX1 * lDeltaX1 + lDeltaY1 * lDeltaY1;
            const lDistanceSquared2 = lDeltaX2 * lDeltaX2 + lDeltaY2 * lDeltaY2;
            return lDistanceSquared1 - lDistanceSquared2;
        };
    }
    Util.DistanceComparator = DistanceComparator;
    ;
    function DatePlusMilliSeconds(aDate, aMilliSeconds) {
        return new Date(aDate.getTime() + aMilliSeconds);
    }
    Util.DatePlusMilliSeconds = DatePlusMilliSeconds;
    ;
    function DateFromStrings(aDateString, aTimeString) {
        return new Date(`${aDateString}T${aTimeString}`);
    }
    Util.DateFromStrings = DateFromStrings;
    ;
    function DateString(aDate) {
        return `${aDate.getFullYear()}-${(aDate.getMonth() + 1).toString().padStart(2, '0')}-${aDate.getDate().toString().padStart(2, '0')}`;
    }
    Util.DateString = DateString;
    ;
    function TimeString(aDate) {
        return `${aDate.getHours().toString().padStart(2, '0')}:${aDate.getMinutes().toString().padStart(2, '0')}:${aDate.getSeconds().toString().padStart(2, '0')}`;
    }
    Util.TimeString = TimeString;
    ;
})(Util || (Util = {}));
;
var Fetch;
(function (Fetch) {
    function UrlQueryString(aApiEndpoint, aQueryParams) {
        const lUrl = new URL(aApiEndpoint);
        if (aQueryParams) {
            Object.keys(aQueryParams).forEach(aKey => {
                const lValue = aQueryParams[aKey];
                if (lValue !== undefined) {
                    // lUrl.searchParams.append(encodeURIComponent(aKey), encodeURIComponent(lValue.toString()));
                    lUrl.searchParams.append(aKey, lValue.toString());
                }
            });
        }
        return lUrl.toString();
    }
    Fetch.UrlQueryString = UrlQueryString;
    ;
    async function FetchedData(aApiEndpoint, aHeaders, aQueryParams) {
        try {
            const lUrlQueryString = UrlQueryString(aApiEndpoint, aQueryParams);
            console.log(`Fetching: ${lUrlQueryString}`);
            const lHeaders = { 'Content-Type': 'application/json', ...aHeaders };
            const lResponse = await fetch(lUrlQueryString, { method: 'GET', headers: lHeaders });
            const lData = await lResponse.json();
            console.log(`Fetch Response ${lResponse.status}: ***${JSON.stringify(lData)}***`);
            return { mData: lData, mResponseOk: lResponse.ok, mResponseStatus: lResponse.status, mErrorMessage: `Received status code ${lResponse.status}` };
        }
        catch (aError) {
            const lErrorMessage = aError.message;
            console.log(`Fetch Error: ${lErrorMessage}`);
            return { mResponseOk: false, mResponseStatus: -1, mErrorMessage: lErrorMessage };
        }
    }
    Fetch.FetchedData = FetchedData;
    ;
})(Fetch || (Fetch = {}));
;
var TransitLandAPIClient;
(function (TransitLandAPIClient) {
    TransitLandAPIClient.cDefaultAPIBase = "https://transit.land/api/v2/rest";
    async function FetchedTransitLandDataPage(aApiKey, aApiEndpoint, aQueryParams) {
        const lHeaders = { 'Content-Type': 'application/json', 'apikey': aApiKey };
        const lResponse = await Fetch.FetchedData(aApiEndpoint, lHeaders, aQueryParams);
        // lResponse.mData = lResponse.mData || {};
        return lResponse;
    }
    TransitLandAPIClient.FetchedTransitLandDataPage = FetchedTransitLandDataPage;
    ;
    async function FetchedTransitLandData(aArrayKey, aApiKey, aApiEndpoint, aQueryParams) {
        var _a, _b, _c;
        const lData = {};
        let lResponse = null;
        let lLinkToNextSet = aApiEndpoint;
        do {
            lResponse = await FetchedTransitLandDataPage(aApiKey, lLinkToNextSet, aQueryParams);
            lData[aArrayKey] = [...(lData[aArrayKey] || []), ...(((_a = lResponse.mData) === null || _a === void 0 ? void 0 : _a[aArrayKey]) || [])]; // Type assertion to make up for failure to infer.
            lLinkToNextSet = (_c = (_b = lResponse.mData) === null || _b === void 0 ? void 0 : _b.meta) === null || _c === void 0 ? void 0 : _c.next;
            aQueryParams = undefined;
        } while (lLinkToNextSet);
        if (lResponse.mData) {
            lResponse.mData[aArrayKey] = lData[aArrayKey];
        }
        return lResponse;
    }
    TransitLandAPIClient.FetchedTransitLandData = FetchedTransitLandData;
    ;
    function Client(aApiKey, aApiBase) {
        const lApiBase = aApiBase || TransitLandAPIClient.cDefaultAPIBase;
        return {
            FetchedOperators: async (aQueryParams) => {
                const lApiEndpoint = `${lApiBase}/operators`;
                return await FetchedTransitLandData("operators", aApiKey, lApiEndpoint, aQueryParams);
            },
            FetchedOperator: async (aOperatorID) => {
                const lApiEndpoint = `${lApiBase}/operators/${aOperatorID}`;
                return await FetchedTransitLandData("operators", aApiKey, lApiEndpoint);
            },
            FetchedRoutes: async (aOperatorID, aQueryParams) => {
                const lApiEndpoint = `${lApiBase}/routes`;
                return await FetchedTransitLandData("routes", aApiKey, lApiEndpoint, { operator_onestop_id: aOperatorID, ...aQueryParams });
            },
            FetchedRoute: async (aRouteID, aQueryParams) => {
                const lApiEndpoint = `${lApiBase}/routes/${aRouteID}`;
                return await FetchedTransitLandData("routes", aApiKey, lApiEndpoint, aQueryParams);
            },
            FetchedTrips: async (aRouteID, aQueryParams) => {
                const lApiEndpoint = `${lApiBase}/routes/${aRouteID}/trips`;
                return await FetchedTransitLandData("trips", aApiKey, lApiEndpoint, aQueryParams);
            },
            FetchedTrip: async (aRouteID, aTripID) => {
                const lApiEndpoint = `${lApiBase}/routes/${aRouteID}/trips/${aTripID}`;
                return await FetchedTransitLandData("trips", aApiKey, lApiEndpoint);
            },
            FetchedBusStops: async (aQueryParams) => {
                const lApiEndpoint = `${lApiBase}/stops`;
                return await FetchedTransitLandData("stops", aApiKey, lApiEndpoint, aQueryParams);
            },
            FetchedBusStop: async (aBusStopID) => {
                const lApiEndpoint = `${lApiBase}/stops/${aBusStopID}`;
                return await FetchedTransitLandData("stops", aApiKey, lApiEndpoint);
            },
            FetchedDepartures: async (aStopID, aQueryParams) => {
                const lApiEndpoint = `${lApiBase}/stops/${aStopID}/departures`;
                return await FetchedTransitLandData("stops", aApiKey, lApiEndpoint, aQueryParams);
            },
        };
    }
    TransitLandAPIClient.Client = Client;
    ;
})(TransitLandAPIClient || (TransitLandAPIClient = {}));
;
var UI;
(function (UI) {
    function ShowPanel(aPanelID) {
        const lPanel = document.getElementById(aPanelID);
        if (lPanel) {
            lPanel.style.display = 'block';
        }
    }
    UI.ShowPanel = ShowPanel;
    ;
    function HidePanel(aPanelID) {
        const lPanel = document.getElementById(aPanelID);
        if (lPanel) {
            lPanel.style.display = 'none';
        }
    }
    UI.HidePanel = HidePanel;
    ;
    function PopulateDropdown(aElementID, aKeyValuePairs) {
        const lDropdown = document.getElementById(aElementID);
        if (lDropdown) {
            lDropdown.options.length = 0; // Clear any existing options
            aKeyValuePairs.forEach(aKeyValuePair => {
                const [aKey, aValue] = aKeyValuePair;
                const lOptionElement = document.createElement('option');
                lOptionElement.text = aValue;
                lOptionElement.value = aKey;
                lDropdown.add(lOptionElement);
            });
        }
    }
    UI.PopulateDropdown = PopulateDropdown;
    function PopulateTable(aTableID, aData, aHeaders) {
        const lTable = document.getElementById(aTableID);
        if (lTable) {
            //!@#TODO: Runtime check that lTable is indeed a table element
            lTable.innerHTML = ''; // Clear existing table data
            // Create table header
            const lTableHead = lTable.createTHead();
            const lHeaderRow = lTableHead.insertRow();
            aHeaders.forEach(aHeader => {
                const lHeaderCell = document.createElement('th');
                lHeaderCell.textContent = aHeader;
                lHeaderRow.appendChild(lHeaderCell);
            });
            // Create table body
            const lTableBody = lTable.createTBody();
            aData.forEach(rowData => {
                const lDataRow = lTableBody.insertRow();
                aHeaders.forEach(header => {
                    const lDataCell = lDataRow.insertCell();
                    lDataCell.textContent = rowData[header].toString();
                });
            });
        }
    }
    UI.PopulateTable = PopulateTable;
    ;
})(UI || (UI = {}));
;
var SettingsUI;
(function (SettingsUI) {
    function LoadSettingsFromStorage() {
        const lStoredSettings = localStorage.getItem('UserSettings');
        if (lStoredSettings) {
            Object.assign(Main.cUserSettings, JSON.parse(lStoredSettings));
        }
        Main.cDestinationFilter = Main.cUserSettings.DestinationFilter.split(',').map(aDestination => aDestination.trim());
        // console.log(JSON.stringify(Main.cDestinationFilter));
    }
    SettingsUI.LoadSettingsFromStorage = LoadSettingsFromStorage;
    ;
    function PopulateSettingsTable() {
        const lSettingsTable = document.getElementById('SettingsTable');
        lSettingsTable.innerHTML = '';
        Object.entries(Main.cUserSettings).forEach(([aKey, aValue]) => {
            const lRow = lSettingsTable.insertRow();
            lRow.insertCell().textContent = aKey;
            const lValueCell = lRow.insertCell();
            const lInput = document.createElement('input');
            lInput.value = aValue;
            lValueCell.appendChild(lInput);
        });
    }
    SettingsUI.PopulateSettingsTable = PopulateSettingsTable;
    ;
    function ButtonSaveSettings() {
        const lSettingsTable = document.getElementById('SettingsTable');
        Array.from(lSettingsTable.rows).forEach(aRow => {
            const lKey = aRow.cells[0].textContent;
            const lValue = aRow.cells[1].firstChild.value;
            if (lKey) {
                Main.cUserSettings[lKey] = lValue;
            }
        });
        localStorage.setItem('UserSettings', JSON.stringify(Main.cUserSettings));
        UI.HidePanel('SettingsPanel');
        UI.ShowPanel('DrivingPanel');
    }
    SettingsUI.ButtonSaveSettings = ButtonSaveSettings;
    ;
    function ButtonCancelSettings() {
        PopulateSettingsTable();
        UI.HidePanel('SettingsPanel');
        UI.ShowPanel('DrivingPanel');
    }
    SettingsUI.ButtonCancelSettings = ButtonCancelSettings;
    ;
    function ButtonSettings() {
        UI.HidePanel('DrivingPanel');
        UI.ShowPanel('SettingsPanel');
    }
    SettingsUI.ButtonSettings = ButtonSettings;
    ;
})(SettingsUI || (SettingsUI = {}));
;
var NewTripUI;
(function (NewTripUI) {
    ;
    async function FetchRoutes() {
        var _a;
        const lTransitLand = Main.TransitLand();
        const lOperatorID = Main.cUserSettings.OperatorID.trim();
        if (lTransitLand && lOperatorID.length > 0) {
            const lFetchResult = await lTransitLand.FetchedRoutes(lOperatorID);
            if ((_a = lFetchResult.mData) === null || _a === void 0 ? void 0 : _a.routes) {
                const lFilteredRoutes = lFetchResult.mData.routes
                    .filter(aRoute => +aRoute.route_short_name > 0 && +aRoute.route_short_name < 500)
                    .filter(aRoute => Main.cDestinationFilter.some(aDestination => aRoute.route_long_name.includes(aDestination)));
                lFilteredRoutes.sort((aRoute1, aRoute2) => +aRoute1.route_short_name - +aRoute2.route_short_name);
                Main.cFetchedRoutes = lFilteredRoutes;
                const lKeyValuePairs = lFilteredRoutes.map(aRoute => [aRoute.onestop_id, `${aRoute.route_short_name}: ${aRoute.route_long_name}`]);
                UI.PopulateDropdown("RoutesList", lKeyValuePairs);
            }
        }
    }
    NewTripUI.FetchRoutes = FetchRoutes;
    ;
    async function FetchBusStops() {
        var _a, _b;
        const lTransitLand = Main.TransitLand();
        const lRoutesList = document.getElementById('RoutesList');
        const lRouteIndex = lRoutesList === null || lRoutesList === void 0 ? void 0 : lRoutesList.selectedIndex;
        if (Main.cCurrentPosition && lTransitLand && lRouteIndex >= 0) {
            const lCurrentLatitude = Main.cCurrentPosition.coords.latitude;
            const lCurrentLongitude = Main.cCurrentPosition.coords.longitude;
            const lRouteSubset = Main.cFetchedRoutes[lRouteIndex];
            const lFetchResult = await lTransitLand.FetchedRoute(lRouteSubset.onestop_id);
            if ((_a = lFetchResult.mData) === null || _a === void 0 ? void 0 : _a.routes) {
                const lRoute = (_b = lFetchResult.mData) === null || _b === void 0 ? void 0 : _b.routes[0];
                //!@#TODO: Sort the route_stops by distance from the current geolocation...
                const lBusStopLocations = lRoute.route_stops.map(aBusStop => ({ mY: aBusStop.stop.geometry.coordinates[0], mX: aBusStop.stop.geometry.coordinates[1], mObject: aBusStop.stop }));
                lBusStopLocations.sort(Util.DistanceComparator({ mX: lCurrentLatitude, mY: lCurrentLongitude }));
                const lKeyValuePairs = lBusStopLocations.map(aBusStopLocation => [aBusStopLocation.mObject.id.toString(), `[${aBusStopLocation.mObject.stop_id}] ${aBusStopLocation.mObject.stop_name}`]);
                UI.PopulateDropdown("BusStopsList", lKeyValuePairs);
                Main.cFetchedRoute = lRoute;
            }
        }
    }
    NewTripUI.FetchBusStops = FetchBusStops;
    ;
    async function FetchTrips() {
        var _a, _b;
        const lTransitLand = Main.TransitLand();
        const lBusStopsList = document.getElementById('BusStopsList');
        const lBusStopID = lBusStopsList === null || lBusStopsList === void 0 ? void 0 : lBusStopsList.value;
        if (Main.cFetchedRoute && lTransitLand && lBusStopID) {
            const lDateInput = document.getElementById('TripSearchDate');
            const lStartTimeInput = document.getElementById('TripSearchStart');
            const lMinutesInput = document.getElementById('TripSearchMinutes');
            const lStartTime = Util.DateFromStrings(lDateInput.value, lStartTimeInput.value);
            const lEndTime = Util.DatePlusMilliSeconds(lStartTime, +lMinutesInput.value * 60 * 1000);
            const lQueryParams = {
                service_date: lDateInput.value,
                start_time: lStartTimeInput.value,
                end_time: Util.TimeString(lEndTime)
            };
            console.log(lQueryParams);
            const lFetchResult = await lTransitLand.FetchedDepartures(lBusStopID, lQueryParams);
            if ((_a = lFetchResult.mData) === null || _a === void 0 ? void 0 : _a.stops) {
                const lDepartures = (_b = lFetchResult.mData) === null || _b === void 0 ? void 0 : _b.stops[0].departures;
                const lKeyValuePairs = lDepartures === null || lDepartures === void 0 ? void 0 : lDepartures.map(aDeparture => [aDeparture.trip.id.toString(), `[${aDeparture.departure_time}] ${aDeparture.trip.trip_headsign}`]);
                UI.PopulateDropdown("TripsList", lKeyValuePairs || []);
            }
        }
    }
    NewTripUI.FetchTrips = FetchTrips;
    ;
    function ButtonStartNewTrip() {
        UI.HidePanel('NewTripPanel');
        UI.ShowPanel('DrivingPanel');
    }
    NewTripUI.ButtonStartNewTrip = ButtonStartNewTrip;
    ;
    function ButtonCancelNewTrip() {
        UI.HidePanel('NewTripPanel');
        UI.ShowPanel('DrivingPanel');
    }
    NewTripUI.ButtonCancelNewTrip = ButtonCancelNewTrip;
    ;
    function ButtonNewTrip() {
        const lNow = Main.CurrentTime();
        const lDateString = Util.DateString(lNow);
        const lTimeString = Util.TimeString(lNow);
        const lDateInput = document.getElementById('TripSearchDate');
        const lStartTimeInput = document.getElementById('TripSearchStart');
        // Set the values of the input elements
        lDateInput.value = lDateString;
        lStartTimeInput.value = lTimeString;
        UI.HidePanel('DrivingPanel');
        UI.ShowPanel('NewTripPanel');
    }
    NewTripUI.ButtonNewTrip = ButtonNewTrip;
    ;
})(NewTripUI || (NewTripUI = {}));
;
var Main;
(function (Main) {
    Main.cUserSettings = {
        TransitLandAPIKey: '',
        OperatorID: '',
        BusStopDelaySeconds: '30',
        DestinationFilter: 'Utrecht, Woerden, Mijdrecht',
    };
    Main.cInitializationTime = new Date();
    Main.cSimulationStartTime = Main.cInitializationTime;
    function CurrentTime() {
        const lNow = new Date();
        const lElapsedTime = lNow.getTime() - Main.cInitializationTime.getTime();
        const lSimulatedNow = Util.DatePlusMilliSeconds(Main.cSimulationStartTime, lElapsedTime);
        return lSimulatedNow;
        // return lNow
    }
    Main.CurrentTime = CurrentTime;
    ;
    function TransitLand() {
        const lApiKey = Main.cUserSettings.TransitLandAPIKey.trim();
        if (lApiKey) {
            return TransitLandAPIClient.Client(lApiKey);
        }
    }
    Main.TransitLand = TransitLand;
    ;
    window.onload = () => {
        UI.ShowPanel('DrivingPanel');
        SettingsUI.LoadSettingsFromStorage();
        SettingsUI.PopulateSettingsTable();
        const lEndTimeInput = document.getElementById('TripSearchMinutes');
        lEndTimeInput.value = "10";
        const lWatchID = navigator.geolocation.watchPosition(aPosition => {
            const lCoordinate = aPosition.coords;
            const lCoordinateSpan = document.getElementById('CoordinateSpan');
            lCoordinateSpan.textContent = `Lat: ${lCoordinate.latitude}, Lon: ${lCoordinate.longitude} (${new Date(aPosition.timestamp).toLocaleString()})`;
            Main.cCurrentPosition = aPosition;
        });
    };
})(Main || (Main = {}));
;
