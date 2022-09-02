/**
 * Handles rendering the calendar given a container element, eventSources, and interaction callbacks.
 */
import {
	Calendar,
	EventApi,
	EventClickArg,
	EventHoveringArg,
	EventSourceInput,
} from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import googleCalendarPlugin from "@fullcalendar/google-calendar";
import iCalendarPlugin from "@fullcalendar/icalendar";
import momentPlugin from "@fullcalendar/moment";
import moment from "moment";
import gbLocale from "@fullcalendar/core/locales/en-gb";

interface ExtraRenderProps {
	eventClick?: (info: EventClickArg) => void;
	select?: (startDate: Date, endDate: Date, allDay: boolean) => Promise<void>;
	modifyEvent?: (event: EventApi, oldEvent: EventApi) => Promise<boolean>;
	eventMouseEnter?: (info: EventHoveringArg) => void;
	firstDay?: number;
}

export function renderCalendar(
	containerEl: HTMLElement,
	eventSources: EventSourceInput[],
	settings?: ExtraRenderProps
): Calendar {
	const isMobile = window.innerWidth < 500;
	const { eventClick, select, modifyEvent, eventMouseEnter } = settings || {};
	const modifyEventCallback =
		modifyEvent &&
		(async ({
			event,
			oldEvent,
			revert,
		}: {
			event: EventApi;
			oldEvent: EventApi;
			revert: () => void;
		}) => {
			const success = await modifyEvent(event, oldEvent);
			if (!success) {
				revert();
			}
		});
	const cal = new Calendar(containerEl, {
		plugins: [
			// View plugins
			dayGridPlugin,
			timeGridPlugin,
			listPlugin,
			// Drag + drop and editing
			interactionPlugin,
			// Remote sources
			googleCalendarPlugin,
			iCalendarPlugin,

			momentPlugin,
		],

		googleCalendarApiKey: "AIzaSyDIiklFwJXaLWuT_4y6I9ZRVVsPuf4xGrk",
		initialView: isMobile ? "timeGrid3Days" : "timeGridWeek",
		nowIndicator: true,
		scrollTimeReset: false,
		dayHeaderFormat: "ddd DD/MM",
		dayHeaderDidMount: (mountArg) => {
			const a = mountArg.el.find("a") as HTMLAnchorElement;

			const localUrl = moment(mountArg.date).format("YYYY-MM-DD");
			// const label = url.searchParams.get('file')

			a.dataset.href = localUrl;
			a.setAttribute("href", localUrl);

			// @ts-ignore
			a.part?.add("link");
			// @ts-ignore
			a.part?.add("internal-link");
			a.classList.add("internal-link");
			a.setAttribute("target", "_blank");
			a.setAttribute("rel", "noopener");
		},

		headerToolbar: isMobile
			? {
					right: "today,prev,next",
					left: "timeGrid3Days,timeGridDay,listWeek",
			  }
			: {
					left: "prev,next today",
					center: "title",
					right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
			  },
		views: {
			timeGridDay: {
				type: "timeGrid",
				duration: { days: 1 },
				buttonText: isMobile ? "1" : "day",
			},
			timeGrid3Days: {
				type: "timeGrid",
				duration: { days: 3 },
				buttonText: "3",
			},
		},
		firstDay: settings?.firstDay,
		eventSources,
		eventClick,

		selectable: select && true,
		selectMirror: select && true,
		select:
			select &&
			(async (info) => {
				await select(info.start, info.end, info.allDay);
				info.view.calendar.unselect();
			}),

		editable: modifyEvent && true,
		eventDrop: modifyEventCallback,
		eventResize: modifyEventCallback,

		// TODO Make this an option and allow first day of week to list "default" as an option
		locales: [gbLocale],
		locale: "en-GB",

		eventMouseEnter,
	});
	cal.render();
	return cal;
}
