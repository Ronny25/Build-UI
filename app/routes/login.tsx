import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import {
  Form,
  json,
  redirect,
  useActionData,
  useLoaderData,
} from '@remix-run/react';
import { commitSession, getSession } from '~/session';

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const { email, password } = Object.fromEntries(formData);

  if (email === 'test@gmail.com' && password === 'password') {
    const session = await getSession();
    session.set('isAdmin', true);

    const headers = new Headers();
    headers.set('Set-Cookie', await commitSession(session));

    return redirect('/', {
      headers,
    });
  }

  let error = 'Invalid login';
  if (!email) error = 'Email is required';
  else if (!password) error = 'Password is required';

  return json({ error }, 401);
}

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'));

  return session.data;
}

export default function LoginPage() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="mt-8">
      {data.isAdmin ? (
        <p>You&apos;re signed in!</p>
      ) : (
        <Form method="post">
          <div className="space-y-2">
            <input
              className="w-full rounded-md border-gray-700 bg-gray-800 text-white focus:border-sky-600 focus:ring-sky-600"
              type="email"
              name="email"
              placeholder="Email"
              required
            />
            <input
              className="w-full rounded-md border-gray-700 bg-gray-800 text-white focus:border-sky-600 focus:ring-sky-600"
              type="password"
              name="password"
              placeholder="Password"
              required
            />
          </div>

          <div className="mt-8">
            <button className="w-full rounded-md bg-sky-600 px-3 py-2 font-medium text-white focus:outline-none focus:ring-2 focus:ring-sky-600 focus:ring-offset-2 focus:ring-offset-gray-900">
              Log in
            </button>
          </div>

          {actionData?.error && (
            <p className="mt-4 font-medium text-red-500">{actionData.error}</p>
          )}
        </Form>
      )}
    </div>
  );
}
