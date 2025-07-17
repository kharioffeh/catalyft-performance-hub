
import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from '@/hooks/use-toast'
import * as THREE from "three"
import NET from "vanta/dist/vanta.net.min"
import { Activity } from 'lucide-react'

interface LoginForm {
  email: string
  password: string
}

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { profile, session } = useAuth()
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>()

  // Vanta background effect
  const vantaRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!vantaRef.current) return
    const vanta = NET({
      el: vantaRef.current,
      THREE,
      color: 0x5e6ad2,
      backgroundColor: 0x101014,
      points: 8,
      maxDistance: 25,
      spacing: 20,
    })
    return () => vanta.destroy()
  }, [])

  // Redirect if already logged in
  React.useEffect(() => {
    if (session && profile) {
      navigate('/dashboard')
    }
  }, [profile, session, navigate])

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)

    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      if (authData.user) {
        toast({
          title: "Success",
          description: "Signed in successfully! Redirecting...",
        })

        // Wait for profile to be fetched by AuthContext
        const checkProfile = setInterval(() => {
          // This will be handled by the useEffect above once profile is loaded
        }, 100)

        // Clear interval after 5 seconds to prevent infinite checking
        setTimeout(() => {
          clearInterval(checkProfile)
        }, 5000)
      }
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while checking authentication
  if (session === undefined) {
    return (
      <div className="relative min-h-screen bg-brand-charcoal text-white font-[Inter] flex items-center justify-center p-4">
        <div ref={vantaRef} className="absolute inset-0 -z-10" />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-white/70">Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-brand-charcoal text-white font-[Inter] flex items-center justify-center p-4">
      {/* Background layers */}
      <div ref={vantaRef} className="absolute inset-0 -z-10" />
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 bg-blue-500 opacity-10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="relative flex flex-col overflow-hidden cursor-default shadow-2xl transition-all duration-500 max-w-xl w-full font-semibold text-white rounded-3xl">
        <div className="absolute z-0 inset-0 backdrop-blur-md overflow-hidden"></div>
        <div className="z-10 absolute inset-0 bg-white bg-opacity-15"></div>
        <div className="absolute inset-0 z-20 overflow-hidden shadow-inner border border-white/20 rounded-3xl"></div>
        
        {/* Top Section - Welcome */}
        <div className="z-30 h-2/4 flex flex-col relative text-center bg-black/10 pt-8 pr-8 pb-8 pl-8 items-center justify-center">
          {/* Logo & Brand */}
          <div className="mb-4">
            <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3 overflow-hidden">
              <div className="absolute z-0 inset-0 backdrop-blur-sm"></div>
              <div className="z-10 absolute inset-0 bg-gradient-to-br from-blue-400/30 to-purple-400/20"></div>
              <div className="absolute inset-0 z-20 border border-white/30 rounded-2xl"></div>
              <Activity className="z-30 h-7 w-7 text-blue-400" />
            </div>
            <h1 className="leading-tight text-5xl font-light text-white tracking-tight mb-2">Welcome Back</h1>
            <p className="leading-relaxed text-sm font-light text-white/80">Sign in to your Catalyft AI account to continue your training journey.</p>
          </div>
        </div>

        {/* Bottom Section - Login Form */}
        <div className="z-30 h-full flex flex-col p-8 justify-start overflow-y-auto">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-medium text-white mb-2">Sign in to your account</h2>
            <p className="text-sm font-light text-white/70">Enter your credentials to access your dashboard</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 mb-6 space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Email</label>
              <div className="relative overflow-hidden rounded-xl">
                <div className="absolute z-0 inset-0 backdrop-blur-sm"></div>
                <div className="z-10 absolute inset-0 bg-white bg-opacity-10"></div>
                <div className="absolute inset-0 z-20 border border-white/20 rounded-xl"></div>
                <input 
                  type="email" 
                  {...register('email', { required: 'Email is required' })}
                  className="z-30 relative bg-transparent w-full px-4 py-3 text-sm placeholder-gray-300 text-white border-none focus:outline-none focus:ring-2 focus:ring-blue-400/50 rounded-xl" 
                  placeholder="Enter your email" 
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-400 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Password</label>
              <div className="relative overflow-hidden rounded-xl">
                <div className="absolute z-0 inset-0 backdrop-blur-sm"></div>
                <div className="z-10 absolute inset-0 bg-white bg-opacity-10"></div>
                <div className="absolute inset-0 z-20 border border-white/20 rounded-xl"></div>
                <input 
                  type="password" 
                  {...register('password', { required: 'Password is required' })}
                  className="z-30 relative bg-transparent w-full px-4 py-3 text-sm placeholder-gray-300 text-white border-none focus:outline-none focus:ring-2 focus:ring-blue-400/50 rounded-xl" 
                  placeholder="Enter your password" 
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-400 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Sign In Button */}
            <div className="relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg pt-4">
              <div className="absolute z-0 inset-0 backdrop-blur-sm"></div>
              <div className="z-10 absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/20"></div>
              <div className="absolute inset-0 z-20 border border-white/30 rounded-xl"></div>
              <button 
                type="submit" 
                disabled={loading}
                className="z-30 relative w-full border-none flex gap-2 text-sm font-semibold text-white bg-transparent py-3 px-4 items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="text-center mt-auto">
            <p className="text-sm font-light text-white/70 mb-3">
              Don't have an account? 
              <Link to="/signup" className="text-blue-400 hover:text-blue-300 transition-colors font-medium ml-1">Sign up here</Link>
            </p>
            <div className="flex gap-4 text-xs font-light text-white/50 items-center justify-center">
              <a href="#" className="hover:text-white/70 transition-colors">Help Center</a>
              <span>•</span>
              <a href="#" className="hover:text-white/70 transition-colors">Contact Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
