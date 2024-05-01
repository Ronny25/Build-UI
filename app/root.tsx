import {
  Form,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  redirect,
  useLoaderData,
  useRouteError,
} from '@remix-run/react';
import type {
  ActionFunctionArgs,
  LinksFunction,
  LoaderFunctionArgs,
} from '@remix-run/node';
import stylesheet from './tailwind.css?url';
import { destroySession, getSession } from './session';

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: stylesheet },
    { rel: 'stylesheet', href: '/fonts/inter/inter.css' },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'));

  return redirect('/', {
    headers: {
      'Set-Cookie': await destroySession(session),
    },
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'));

  return {
    session: session.data,
  };
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { session } = useLoaderData<typeof loader>();

  return (
    <div className="p-4">
      <header>
        <div className="flex justify-between text-sm">
          <p className="uppercase">
            <span className="text-gray-500">Dmytro</span>
            <span className="font-semibold text-gray-200">Kotkin</span>
          </p>

          <div className="text-gray-500">
            {session.isAdmin ? (
              <Form method="post">
                <button>Logout</button>
              </Form>
            ) : (
              <Link to="/login">Log in</Link>
            )}
          </div>
        </div>

        <div className="my-20">
          <div className="text-center">
            <h1 className="text-5xl font-semibold tracking-tighter text-white">
              <Link to="/">Work Journal</Link>
            </h1>
            <p className="mt-2 tracking-tight text-gray-500">
              Doings and learnings. Updated weekly.
            </p>
          </div>
        </div>
      </header>
      <Outlet />
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <div className="h-screen">
      <div className="flex h-full flex-col items-center justify-center">
        <p className="text-3xl">Whoops!</p>

        {isRouteErrorResponse(error) ? (
          <p>
            {error.status} - {error.statusText}
          </p>
        ) : error instanceof Error ? (
          <p>{error.message}</p>
        ) : (
          <p>Unknown error</p>
        )}
      </div>
    </div>
  );
}
