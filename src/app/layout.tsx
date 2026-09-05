import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Literata, JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const serif = Literata({
  subsets: ["latin"],
  variable: "--font-serif",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Bookify — Milliy Kitob & Audio Sanatoriysi",
  description: "O'zbekistonning eng sara durdona asarlari, audio spektakllari va adabiy chempionati.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" suppressHydrationWarning className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                // Wrap requestIdleCallback
                if (typeof window.requestIdleCallback === 'function') {
                  var _origRIC = window.requestIdleCallback;
                  window.requestIdleCallback = function(cb, opts) {
                    return _origRIC.call(window, function(deadline) {
                      try {
                        return cb(deadline);
                      } catch (err) {
                        var es = String(err && (err.message || err.stack || err));
                        if (es.indexOf('startTime') !== -1 || es.indexOf('reportAllChanges') !== -1) {
                          return;
                        }
                        throw err;
                      }
                    }, opts);
                  };
                }

                // Wrap requestAnimationFrame
                if (typeof window.requestAnimationFrame === 'function') {
                  var _origRAF = window.requestAnimationFrame;
                  window.requestAnimationFrame = function(cb) {
                    return _origRAF.call(window, function(time) {
                      try {
                        return cb(time);
                      } catch (err) {
                        var es = String(err && (err.message || err.stack || err));
                        if (es.indexOf('startTime') !== -1 || es.indexOf('reportAllChanges') !== -1) {
                          return;
                        }
                        throw err;
                      }
                    });
                  };
                }

                var origError = console.error;
                console.error = function() {
                  var str = Array.prototype.slice.call(arguments).map(function(a) {
                    return (a && a.message) ? a.message : String(a);
                  }).join(' ');
                  if (str.indexOf('startTime') !== -1 || str.indexOf('reportAllChanges') !== -1) {
                    return;
                  }
                  origError.apply(console, arguments);
                };

                window.onerror = function(msg, url, line, col, err) {
                  var s = String(msg || '') + ' ' + String((err && (err.message || err.stack)) || '');
                  if (s.indexOf('startTime') !== -1 || s.indexOf('reportAllChanges') !== -1) {
                    return true;
                  }
                };

                window.addEventListener('error', function(e) {
                  var s = String((e && e.message) || '') + ' ' + String((e && e.error && (e.error.message || e.error.stack)) || '');
                  if (s.indexOf('startTime') !== -1 || s.indexOf('reportAllChanges') !== -1) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    return true;
                  }
                }, true);

                window.addEventListener('unhandledrejection', function(e) {
                  var s = String((e && e.reason && (e.reason.message || e.reason.stack)) || (e && e.reason) || '');
                  if (s.indexOf('startTime') !== -1 || s.indexOf('reportAllChanges') !== -1) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                  }
                }, true);
              }
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="font-sans antialiased bg-[#F8FAFC] dark:bg-[#080B0F] text-stone-900 dark:text-stone-100 min-h-screen">
        <Toaster position="top-center" reverseOrder={false} />
        {children}
      </body>
    </html>
  );
}
