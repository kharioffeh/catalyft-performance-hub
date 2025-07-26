
import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import * as THREE from "three"
import NET from "vanta/dist/vanta.net.min"
import { Activity } from 'lucide-react'

interface SignupForm {
  fullName: string
  email: string
  password: string
}

const Signup: React.FC = () => {
  const [loading, setLoading] = useState(false)
  // Role selection removed - all users are solo
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>()

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

  const onSubmit = async (data: SignupForm) => {
    setLoading(true)

    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: 'solo', // All users are solo now
          },
        },
      })

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      if (authData.user) {
        // Insert profile data
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              email: data.email,
              full_name: data.fullName,
              role: 'solo', // All users are solo now
            }
          ])

        if (profileError) {
          console.error('Error creating profile:', profileError)
          toast({
            title: "Profile creation failed",
            description: "Account created but profile setup failed. Please contact support.",
            variant: "destructive",
          })
          return
        }

        toast({
          title: "Account created!",
          description: "Your account has been created successfully.",
        })

        // All users navigate to dashboard now (solo role)
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Signup error:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Role selection function removed - all users are solo

  return (
    <div className="relative min-h-screen bg-brand-charcoal text-white font-[Inter] flex items-center justify-center p-4">
      {/* Background layers */}
      <div ref={vantaRef} className="absolute inset-0 -z-10" />
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 bg-blue-500 opacity-10 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="relative flex flex-col overflow-hidden cursor-default shadow-2xl transition-all duration-500 max-w-2xl w-full font-semibold text-white rounded-3xl">
        <div className="absolute z-0 inset-0 backdrop-blur-md overflow-hidden"></div>
        <div className="z-10 absolute inset-0 bg-white bg-opacity-15"></div>
        <div className="absolute inset-0 z-20 overflow-hidden shadow-inner border border-white/20 rounded-3xl"></div>
        
        {/* Top Section - Welcome & Progress */}
        <div className="z-30 h-2/4 flex flex-col relative text-center bg-black/10 pt-8 pr-8 pb-8 pl-8 items-center justify-center">
          {/* Logo & Brand */}
          <div className="mb-4">
            <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3 overflow-hidden">
              <div className="absolute z-0 inset-0 backdrop-blur-sm"></div>
              <div className="z-10 absolute inset-0 bg-gradient-to-br from-blue-400/30 to-purple-400/20"></div>
              <div className="absolute inset-0 z-20 border border-white/30 rounded-2xl"></div>
              <Activity className="z-30 h-7 w-7 text-blue-400" />
            </div>
            <h1 className="leading-tight text-5xl font-light text-white tracking-tight mb-2">Welcome to Catalyft AI</h1>
            <p className="leading-relaxed text-sm font-light text-white/80">Let's get you set up with your new account in just a few simple steps.</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold backdrop-blur-sm bg-gradient-to-br from-blue-400/40 to-purple-400/20 border border-white/30">1</div>
              <span className="text-xs font-medium text-white/90 hidden sm:block">Account</span>
            </div>
            <div className="w-6 h-px bg-white/30"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold backdrop-blur-sm bg-white/10 border border-white/20">2</div>
              <span className="text-xs font-medium text-white/60 hidden sm:block">Setup</span>
            </div>
            <div className="w-6 h-px bg-white/30"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold backdrop-blur-sm bg-white/10 border border-white/20">3</div>
              <span className="text-xs font-medium text-white/60 hidden sm:block">Complete</span>
            </div>
          </div>
        </div>

        {/* Bottom Section - Signup Form */}
        <div className="z-30 h-full flex flex-col p-8 justify-start overflow-y-auto">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-medium text-white mb-2">Create your account</h2>
            <p className="text-sm font-light text-white/70">Step 1 of 3 • Join the future of performance coaching</p>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 mb-6 space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Full Name</label>
              <div className="relative overflow-hidden rounded-xl">
                <div className="absolute z-0 inset-0 backdrop-blur-sm"></div>
                <div className="z-10 absolute inset-0 bg-white bg-opacity-10"></div>
                <div className="absolute inset-0 z-20 border border-white/20 rounded-xl"></div>
                <input 
                  type="text" 
                  {...register('fullName', { required: 'Full name is required' })}
                  className="z-30 relative bg-transparent w-full px-4 py-3 text-sm placeholder-gray-300 text-white border-none focus:outline-none focus:ring-2 focus:ring-blue-400/50 rounded-xl" 
                  placeholder="Enter your full name" 
                />
              </div>
              {errors.fullName && (
                <p className="text-sm text-red-400 mt-1">{errors.fullName.message}</p>
              )}
            </div>

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

            {/* Role is now automatically set to 'solo' */}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Create password</label>
              <div className="relative overflow-hidden rounded-xl">
                <div className="absolute z-0 inset-0 backdrop-blur-sm"></div>
                <div className="z-10 absolute inset-0 bg-white bg-opacity-10"></div>
                <div className="absolute inset-0 z-20 border border-white/20 rounded-xl"></div>
                <input 
                  type="password" 
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  className="z-30 relative bg-transparent w-full px-4 py-3 text-sm placeholder-gray-300 text-white border-none focus:outline-none focus:ring-2 focus:ring-blue-400/50 rounded-xl" 
                  placeholder="Minimum 6 characters" 
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-400 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Continue Button */}
            <div className="relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg pt-4">
              <div className="absolute z-0 inset-0 backdrop-blur-sm"></div>
              <div className="z-10 absolute inset-0 bg-gradient-to-r from-blue-500/30 to-purple-500/20"></div>
              <div className="absolute inset-0 z-20 border border-white/30 rounded-xl"></div>
              <button 
                type="submit" 
                disabled={loading || !watchedRole}
                className="z-30 relative w-full border-none flex gap-2 text-sm font-semibold text-white bg-transparent py-3 px-4 items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{loading ? 'Creating account...' : 'Create Account'}</span>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="text-center mt-auto">
            <p className="text-sm font-light text-white/70 mb-3">
              Already have an account? 
              <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors font-medium ml-1">Sign in here</Link>
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

export default Signup
