import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { Form, redirect, useLoaderData } from '@remix-run/react';
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
  return null;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'));

  return session.data;
}

export default function LoginPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="mt-8">
      {data.isAdmin ? (
        <p>You&apos;re signed in!</p>
      ) : (
        <Form method="post">
          <input
            className="text-gray-900"
            type="email"
            name="email"
            placeholder="Email"
            required
          />
          <input
            className="text-gray-900"
            type="password"
            name="password"
            placeholder="Password"
            required
          />
          <button className="bg-blue-500 px-3 py-2 font-medium text-white">
            Log in
          </button>
        </Form>
      )}
    </div>
  );
}
