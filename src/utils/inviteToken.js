// Split out from main.jsx to avoid a circular import: AcceptInvite.jsx needs
// this constant, and main.jsx needs AcceptInvite.jsx. main.jsx importing
// AcceptInvite.jsx while AcceptInvite.jsx imported the constant back from
// main.jsx worked under Vite's dev server but threw a TDZ ReferenceError
// during Rollup's production bundling — killing the entire app before
// ReactDOM.createRoot().render() ever ran (blank page, no console output).
//
// Survives the Zitadel redirect round-trip — signinRedirect() navigates away
// entirely, so React state can't carry the token; sessionStorage can.
export const INVITE_TOKEN_KEY = 'dm_pending_invite_token';
