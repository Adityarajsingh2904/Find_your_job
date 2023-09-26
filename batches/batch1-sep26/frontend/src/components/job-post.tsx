"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Loader2,
  Briefcase,
  MapPin,
  Clock,
  Calendar,
  DollarSign,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import type { JobPost, JobPostForm } from "@/types/jobpost";
import { createJobPost } from "@/actions/jobPost";

const formSchema = z.object({
  job_title: z.string().min(3, { message: "Job title is required" }),
  type_of_work: z.string().min(1, { message: "Type of work is required" }),
  employer_name: z.string().optional(),
  place_of_work: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  pincode: z.string().optional(),
  vacancies: z.coerce.number().int().positive().optional(),
  special_woman_provision: z.boolean().default(false),
  special_transgender_provision: z.boolean().default(false),
  special_disabled_provision: z.boolean().default(false),
  wage: z.string().optional(),
  hours_per_week: z.coerce.number().int().positive().optional(),
  job_duration: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  job_role_description: z.string().optional(),
});

export default function JobPostForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      job_title: "",
      type_of_work: "",
      employer_name: "",
      place_of_work: "",
      city: "",
      state: "",
      district: "",
      pincode: "",
      vacancies: undefined,
      special_woman_provision: false,
      special_transgender_provision: false,
      special_disabled_provision: false,
      wage: "",
      hours_per_week: undefined,
      job_duration: "",
      start_time: "",
      end_time: "",
      job_role_description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      // Transform form data to match JobPost interface
      const jobPostData: JobPostForm = {
        id: crypto.randomUUID(), // Generate a random ID for now
        employer_id: "current-employer-id",
        job_title: values.job_title,
        type_of_work: values.type_of_work,
        employer_name: values.employer_name,
        place_of_work: values.place_of_work,
        city: values.city,
        state: values.state,
        district: values.district,
        pincode: values.pincode,
        vacancies: values.vacancies,
        special_woman_provision: values.special_woman_provision,
        special_transgender_provision: values.special_transgender_provision,
        special_disability_provision: values.special_disabled_provision,
        wage: values.wage,
        hours_per_week: values.hours_per_week,
        job_duration: values.job_duration,
        start_time: values.start_time,
        end_time: values.end_time,
        job_role_description: values.job_role_description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await createJobPost(jobPostData);

      setSubmitSuccess(true);
      // Reset form after successful submission
      form.reset();
    } catch (error) {
      console.error("Error creating job post:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container max-w-3xl mx-auto py-6 px-4 sm:px-6">
      <Card className="border-blue-100 shadow-md">
        <CardHeader className="bg-blue-50 border-b border-blue-100">
          <CardTitle className="text-2xl text-blue-800">
            Post a New Job
          </CardTitle>
          <CardDescription className="text-blue-600">
            Fill out the form below to create a new job posting
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {submitSuccess ? (
            <div className="bg-green-50 p-6 rounded-md text-green-800 mb-6 border border-green-200 shadow-sm">
              <h3 className="font-medium text-lg flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-600"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Job Posted Successfully!
              </h3>
              <p>Your job has been posted and is now visible to workers.</p>
              <Button
                className="mt-4 bg-green-600 hover:bg-green-700"
                onClick={() => setSubmitSuccess(false)}
              >
                Post Another Job
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <Accordion
                  type="single"
                  collapsible
                  defaultValue="basic-info"
                  className="w-full"
                >
                  {/* Basic Job Information */}
                  <AccordionItem
                    value="basic-info"
                    className="border border-blue-100 rounded-md mb-4"
                  >
                    <AccordionTrigger className="text-lg font-medium text-blue-700 px-4 py-3 hover:bg-blue-50 rounded-t-md">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Basic Job Information
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4 px-4 pb-4 bg-white">
                      <FormField
                        control={form.control}
                        name="job_title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-blue-700">
                              Job Title*
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. Construction Worker"
                                {...field}
                                className="border-blue-200 focus-visible:ring-blue-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="type_of_work"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-blue-700">
                              Type of Work*
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="border-blue-200 focus-visible:ring-blue-500">
                                  <SelectValue placeholder="Select type of work" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="full-time">
                                  Full-time
                                </SelectItem>
                                <SelectItem value="part-time">
                                  Part-time
                                </SelectItem>
                                <SelectItem value="contract">
                                  Contract
                                </SelectItem>
                                <SelectItem value="temporary">
                                  Temporary
                                </SelectItem>
                                <SelectItem value="seasonal">
                                  Seasonal
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="employer_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-blue-700">
                              Employer/Company Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. ABC Construction"
                                {...field}
                                className="border-blue-200 focus-visible:ring-blue-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="place_of_work"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-blue-700">
                              Place of Work
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. Construction Site, Factory"
                                {...field}
                                className="border-blue-200 focus-visible:ring-blue-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  {/* Location Details */}
                  <AccordionItem
                    value="location"
                    className="border border-blue-100 rounded-md mb-4"
                  >
                    <AccordionTrigger className="text-lg font-medium text-blue-700 px-4 py-3 hover:bg-blue-50 rounded-t-md">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Location Details
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4 px-4 pb-4 bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-blue-700">
                                City
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. Mumbai"
                                  {...field}
                                  className="border-blue-200 focus-visible:ring-blue-500"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-blue-700">
                                State
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. Maharashtra"
                                  {...field}
                                  className="border-blue-200 focus-visible:ring-blue-500"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="district"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-blue-700">
                                District
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. Thane"
                                  {...field}
                                  className="border-blue-200 focus-visible:ring-blue-500"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="pincode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-blue-700">
                                Pincode
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. 400001"
                                  {...field}
                                  className="border-blue-200 focus-visible:ring-blue-500"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Job Details */}
                  <AccordionItem
                    value="job-details"
                    className="border border-blue-100 rounded-md mb-4"
                  >
                    <AccordionTrigger className="text-lg font-medium text-blue-700 px-4 py-3 hover:bg-blue-50 rounded-t-md">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Job Details
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4 px-4 pb-4 bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="vacancies"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-blue-700">
                                Number of Vacancies
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="e.g. 5"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(e.target.valueAsNumber)
                                  }
                                  className="border-blue-200 focus-visible:ring-blue-500"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="wage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-blue-700">
                                Wage/Salary
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. ₹500 per day"
                                  {...field}
                                  className="border-blue-200 focus-visible:ring-blue-500"
                                />
                              </FormControl>
                              <FormDescription>
                                Specify the amount and period (per hour, day,
                                week, etc.)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="hours_per_week"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-blue-700">
                                Hours Per Week
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="e.g. 40"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(e.target.valueAsNumber)
                                  }
                                  className="border-blue-200 focus-visible:ring-blue-500"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="job_duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-blue-700">
                                Job Duration
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="border-blue-200 focus-visible:ring-blue-500">
                                    <SelectValue placeholder="Select duration" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1-day">1 Day</SelectItem>
                                  <SelectItem value="1-week">1 Week</SelectItem>
                                  <SelectItem value="2-weeks">
                                    2 Weeks
                                  </SelectItem>
                                  <SelectItem value="1-month">
                                    1 Month
                                  </SelectItem>
                                  <SelectItem value="3-months">
                                    3 Months
                                  </SelectItem>
                                  <SelectItem value="6-months">
                                    6 Months
                                  </SelectItem>
                                  <SelectItem value="permanent">
                                    Permanent
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Schedule Information */}
                  <AccordionItem
                    value="schedule"
                    className="border border-blue-100 rounded-md mb-4"
                  >
                    <AccordionTrigger className="text-lg font-medium text-blue-700 px-4 py-3 hover:bg-blue-50 rounded-t-md">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Schedule Information
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4 px-4 pb-4 bg-white">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="start_time"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-blue-700">
                                Start Time
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="time"
                                  {...field}
                                  className="border-blue-200 focus-visible:ring-blue-500"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="end_time"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-blue-700">
                                End Time
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="time"
                                  {...field}
                                  className="border-blue-200 focus-visible:ring-blue-500"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Special Provisions */}
                  <AccordionItem
                    value="special-provisions"
                    className="border border-blue-100 rounded-md mb-4"
                  >
                    <AccordionTrigger className="text-lg font-medium text-blue-700 px-4 py-3 hover:bg-blue-50 rounded-t-md">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Special Provisions
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4 px-4 pb-4 bg-white">
                      <FormField
                        control={form.control}
                        name="special_woman_provision"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-blue-100 p-4 hover:bg-blue-50/30 transition-colors">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="border-pink-300 data-[state=checked]:bg-pink-500 data-[state=checked]:text-white"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <div className="flex items-center gap-2">
                                <FormLabel>
                                  Special Provision for Women
                                </FormLabel>
                                {field.value && (
                                  <Badge className="bg-pink-500 hover:bg-pink-600">
                                    Women
                                  </Badge>
                                )}
                              </div>
                              <FormDescription>
                                Check this if you have special accommodations or
                                preferences for women workers
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="special_transgender_provision"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-blue-100 p-4 hover:bg-blue-50/30 transition-colors">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="border-purple-300 data-[state=checked]:bg-purple-500 data-[state=checked]:text-white"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <div className="flex items-center gap-2">
                                <FormLabel>
                                  Special Provision for Transgender Individuals
                                </FormLabel>
                                {field.value && (
                                  <Badge className="bg-purple-500 hover:bg-purple-600">
                                    LGBTQ+
                                  </Badge>
                                )}
                              </div>
                              <FormDescription>
                                Check this if you have special accommodations or
                                preferences for transgender workers
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="special_disabled_provision"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-blue-100 p-4 hover:bg-blue-50/30 transition-colors">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="border-blue-300 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <div className="flex items-center gap-2">
                                <FormLabel>
                                  Special Provision for Disabled Individuals
                                </FormLabel>
                                {field.value && (
                                  <Badge className="bg-blue-500 hover:bg-blue-600">
                                    Disabled
                                  </Badge>
                                )}
                              </div>
                              <FormDescription>
                                Check this if you have special accommodations or
                                preferences for disabled workers
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  {/* Job Description */}
                  <AccordionItem
                    value="job-description"
                    className="border border-blue-100 rounded-md mb-4"
                  >
                    <AccordionTrigger className="text-lg font-medium text-blue-700 px-4 py-3 hover:bg-blue-50 rounded-t-md">
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        Job Description
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4 px-4 pb-4 bg-white">
                      <FormField
                        control={form.control}
                        name="job_role_description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-blue-700">
                              Job Role Description
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe the job responsibilities, requirements, and any other relevant details..."
                                className="min-h-[150px] border-blue-200 focus-visible:ring-blue-500"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Posting Job...
                      </>
                    ) : (
                      "Post Job"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
