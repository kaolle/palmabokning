# Palmabokning

A family vacation property booking calendar. Multiple family members coordinate stays at a shared holiday property — each person sees a 12-month scrollable calendar, books date ranges, and sees others' bookings color-coded by name. Your own bookings are highlighted distinctly.

## Tech Stack

- **Frontend:** React 18 + TypeScript (Create React App), date-fns (Swedish locale), axios, react-responsive
- **Tests:** Jest, @testing-library/react, msw
- **Static server:** Express on Node 18 (`server.js`, port 4011, HTTPS-enforced)
- **API backend:** Separate service (dev `localhost:8080`, prod on Heroku) — not in this repo
- **Auth:** JWT in localStorage, manually decoded for expiry checks

## Architecture

- `App.js` wraps everything in `AuthProvider`, renders `LoginDialog` + `Calendar`
- `Calendar.tsx` — main UI: week-grid, date selection, scroll persistence
- `authentication/AuthContext.tsx` — JWT, role and expiry handling
- `rest/booking.ts`, `rest/authentication.ts` — axios endpoints with token interceptor
- `FamilyMemberAdmin.tsx` — uberhead-only roster management

## Domain Model

```
FamilyMember { id, name, phrase }   // phrase = signup invite token
Booking      { id, from, to, familyMember }
```

## Features

- Login + signup (signup requires an invite "phrase")
- 12-month rolling calendar, click-to-select date range, hover tooltips
- Color-per-family-member rendering, "your booking" highlight
- Role `ROLE_FAMILY_UBERHEAD` → can book on behalf of others and manage the roster
- Scroll position restored after a booking is created
- Swedish locale, mobile-responsive layout

---

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
