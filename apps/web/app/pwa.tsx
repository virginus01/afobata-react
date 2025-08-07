// "use client";

// import { useEffect, useState } from "react";

// function urlBase64ToUint8Array(base64String: string) {
//   const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
//   const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

//   const rawData = window.atob(base64);
//   const outputArray = new Uint8Array(rawData.length);

//   for (let i = 0; i < rawData.length; ++i) {
//     outputArray[i] = rawData.charCodeAt(i);
//   }
//   return outputArray;
// }

// function PushNotificationManager() {
//   const [isSupported, setIsSupported] = useState(false);
//   const [subscription, setSubscription] = useState<PushSubscription | null>(
//     null
//   );
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState<string | null>(null);
//   const [status, setStatus] = useState<string>("");

//   useEffect(() => {
//     if (
//       typeof window !== "undefined" &&
//       "serviceWorker" in navigator &&
//       "PushManager" in window
//     ) {
//       setIsSupported(true);
//       checkSubscription();
//     }
//   }, []);

//   async function checkSubscription() {
//     try {
//       const registration = await navigator.serviceWorker.getRegistration();
//       if (registration) {
//         const existingSub = await registration.pushManager.getSubscription();
//         setSubscription(existingSub);
//       }
//     } catch (error) {
//       console.error("Failed to check subscription:", error);
//     }
//   }

//   async function subscribeToPush() {
//     try {
//       setError(null);
//       setStatus("Subscribing...");

//       const registration = await navigator.serviceWorker.register("/sw.js", {
//         scope: "/",
//       });

//       const sub = await registration.pushManager.subscribe({
//         userVisibleOnly: true,
//         applicationServerKey: urlBase64ToUint8Array(
//           process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
//         ),
//       });

//       const result = await subscribeUser(JSON.stringify(sub) as any);

//       if (result?.success) {
//         setSubscription(sub);
//         setStatus("Subscribed successfully!");
//       } else {
//         console.error(result?.error || "Failed to subscribe");
//         return;
//       }
//     } catch (error: any) {
//       console.error("Subscription error:", error);
//       setError(error.message || "Failed to subscribe");
//       setStatus("");
//     }
//   }

//   async function unsubscribeFromPush() {
//     try {
//       setError(null);
//       setStatus("Unsubscribing...");

//       if (subscription) {
//         const endpoint = subscription.endpoint;
//         await subscription.unsubscribe();
//         await unsubscribeUser(endpoint);
//         setSubscription(null);
//         setStatus("Unsubscribed successfully!");
//       }
//     } catch (error: any) {
//       console.error("Unsubscribe error:", error);
//       setError(error.message || "Failed to unsubscribe");
//       setStatus("");
//     }
//   }

//   async function sendTestNotification() {
//     try {
//       setError(null);
//       setStatus("Sending notification...");

//       if (!subscription) {
//         console.error("No active subscription");
//         return;
//       }

//       if (!message.trim()) {
//         console.error("Please enter a message");
//         return;
//       }

//       const result = await sendPushNotification(message);

//       if (result.success) {
//         setMessage("");
//         setStatus("Notification sent!");
//       } else {
//         console.error(result.error || "Failed to send notification");
//         return;
//       }
//     } catch (error: any) {
//       console.error("Send notification error:", error);
//       setError(error.message || "Failed to send notification");
//       setStatus("");
//     }
//   }

//   if (!isSupported) {
//     return (
//       <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
//         Push notifications are not supported in this browser.
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 space-y-4">
//       <h3 className="text-xl font-bold">Push Notifications</h3>

//       {error && (
//         <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
//           {error}
//         </div>
//       )}

//       {status && (
//         <div className="p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
//           {status}
//         </div>
//       )}

//       {subscription ? (
//         <div className="space-y-4">
//           <p className="text-green-600">
//             ✓ You are subscribed to push notifications
//           </p>

//           <div className="space-y-2">
//             <input
//               type="text"
//               placeholder="Enter notification message"
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               className="w-full p-2 border rounded"
//             />

//             <div className="space-x-2">
//               <button
//                 onClick={sendTestNotification}
//                 className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
//                 disabled={!message.trim()}
//               >
//                 Send Test
//               </button>

//               <button
//                 onClick={unsubscribeFromPush}
//                 className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
//               >
//                 Unsubscribe
//               </button>
//             </div>
//           </div>
//         </div>
//       ) : (
//         <div>
//           <p className="text-gray-600 mb-2">
//             You are not subscribed to push notifications.
//           </p>
//           <button
//             onClick={subscribeToPush}
//             className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
//           >
//             Subscribe
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// export function Pwa() {
//   return (
//     <div className="max-w-2xl mx-auto">
//       <PushNotificationManager />
//     </div>
//   );
// }
