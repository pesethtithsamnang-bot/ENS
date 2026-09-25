import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PublicLayout } from '../components/layout/PublicLayout'
import { HomePage } from '../pages/HomePage'
import { ArticlePage } from '../pages/ArticlePage'
import { CategoryPage } from '../pages/CategoryPage'
import { SearchPage } from '../pages/SearchPage'
import { TermsPage } from '../pages/TermsPage'
import { CookiePolicyPage } from '../pages/CookiePolicyPage'
import { SignInPage } from '../pages/SignInPage'
import { SignUpPage } from '../pages/SignUpPage'
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage'
import { ResetPasswordPage } from '../pages/ResetPasswordPage'
import { SavedPage } from '../pages/SavedPage'
import { ProfilePage } from '../pages/ProfilePage'
import { WritePage } from '../pages/WritePage'
import { AuthorProfilePage } from '../pages/AuthorProfilePage'
import { LibraryPage } from '../pages/LibraryPage'
import { BookDetailPage } from '../pages/BookDetailPage'
import { BookReaderPage } from '../pages/BookReaderPage'
import { CustomPage } from '../pages/CustomPage'
import { DonatePage } from '../pages/DonatePage'
import { FeedbackPage } from '../pages/FeedbackPage'
import { DetailsPage } from '../pages/DetailsPage'
import { NotFoundPage } from '../pages/NotFoundPage'

export const router = createBrowserRouter([
  { path: '/library/:id/read', element: <BookReaderPage /> },
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/post/:slug', element: <ArticlePage /> },
      { path: '/category/:slug', element: <CategoryPage /> },
      { path: '/search', element: <SearchPage /> },
      { path: '/terms', element: <TermsPage /> },
      { path: '/cookie-policy', element: <CookiePolicyPage /> },
      { path: '/details', element: <DetailsPage /> },
      { path: '/contact', element: <Navigate to="/details" replace /> },
      { path: '/about', element: <Navigate to="/details" replace /> },
      { path: '/signin', element: <SignInPage /> },
      { path: '/signup', element: <SignUpPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
      { path: '/saved', element: <SavedPage /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/write', element: <WritePage /> },
      { path: '/write/:id', element: <WritePage /> },
      { path: '/author/:id', element: <AuthorProfilePage /> },
      { path: '/library', element: <LibraryPage /> },
      { path: '/library/:id', element: <BookDetailPage /> },
      { path: '/page/:slug', element: <CustomPage /> },
      { path: '/donate', element: <DonatePage /> },
      { path: '/feedback', element: <FeedbackPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
