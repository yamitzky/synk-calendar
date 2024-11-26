# Synk Calendar

Synk Calendar is a web application designed to display Google Calendar contents.

It was developed with use cases in mind such as sharing shifts or personal
events, where the goal is to "provide free view-only access to calendar
information."

## Features

- Integration with Google Calendar
- Switchable views: month, week, 4-day, and day
- Mobile/PC compatibility
- Detailed event display
- Reminders (Experimental)
- Multi-language support (i18n)

## Technology Stack and Libraries

- TypeScript
- React
- Remix
- Google Calendar API
- FullCalendar

## Setting Up the Development Environment

1. Clone the repository:

```bash
git clone https://github.com/yamitzky/synk-calendar.git
cd synk-calendar
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables. Create a `.env` file and configure the
   necessary variables:

```
# Specify the file path for the service account
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/credentials.json
CALENDAR_IDS=id@domain.com,id2,id3
# For Google Workspace, domain-wide delegation and delegated email address are required https://developers.google.com/admin-sdk/directory/v1/guides/delegation
GOOGLE_AUTH_SUBJECT=your-email@example.com
# The following environment variables are only required if you're using reminders
REMINDER_SETTINGS=[{"minutesBefore":10,"notificationType":"console"},{"minutesBefore":30,"notificationType":"webhook"}]
WEBHOOK_URL=https://your-webhook-url.com
# Set this if you want to customize the reminder template text (Eta)
REMINDER_TEMPLATE="Reminder: <%= it.title %> starts in <%= it.minutesBefore %> minutes."
```

4. Start the development server:

```bash
pnpm dev
```

The application will be available at http://localhost:5173.

## Building and Running in Production

1. Build the application:

```bash
pnpm build
```

2. Run the application in a production environment:

```bash
pnpm start
```

## Testing

To run tests:

```bash
pnpm test
```

## License

This project is released under the MIT License.
