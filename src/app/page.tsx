import { getPosts } from "@/actions/post.action";
import { getDbUserId } from "@/actions/user.action";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import WhoToFollow from "@/components/WhoToFollow";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const user = await currentUser();
  const posts = await getPosts();
  const dbUserId = await getDbUserId();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content - Posts Feed */}
          <div className="lg:col-span-8 space-y-6">
            {user && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-gray-100 dark:border-gray-700">
                <CreatePost />
              </div>
            )}

            <div className="space-y-6">
              {posts.map((post) => (
                <div 
                  key={post.id} 
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden"
                >
                  <PostCard post={post} dbUserId={dbUserId} />
                </div>
              ))}
            </div>

            {posts.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 text-center border border-gray-100 dark:border-gray-700">
                <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                  No posts yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                  Be the first to share something!
                </p>
                {user && (
                  <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-full transition-colors duration-300">
                    Create Post
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-24 space-y-6">
              {/* Welcome Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                    {user ? user.firstName?.charAt(0) || '👋' : '✨'}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                      {user ? `Hi, ${user.firstName}!` : "Welcome to Socially!"}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user ? "Ready to connect?" : "Join the community"}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                  {user 
                    ? "Share your thoughts with your friends."
                    : "Sign in to discover amazing content."
                  }
                </p>
                {!user && (
                  <div className="flex space-x-3">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-full transition-colors duration-300 text-sm">
                      Sign Up
                    </button>
                    <button className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-full transition-colors duration-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                      Learn More
                    </button>
                  </div>
                )}
              </div>

              {/* Who to Follow */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                <WhoToFollow />
              </div>

              {/* Trending Topics */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Trending Topics
                </h3>
                <div className="space-y-4">
                  {[
                    { name: 'Technology', posts: '24.5K' },
                    { name: 'Design', posts: '18.2K' },
                    { name: 'Programming', posts: '15.7K' },
                    { name: 'Travel', posts: '12.9K' }
                  ].map((topic) => (
                    <a 
                      key={topic.name} 
                      href="#" 
                      className="block group"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            #{topic.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {topic.posts} posts
                          </p>
                        </div>
                        <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </a>
                  ))}
                </div>
                <button className="mt-4 text-sm text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors w-full text-left">
                  Show more
                </button>
              </div>

              {/* Footer Links */}
              <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-2 px-2">
                <a href="#" className="hover:underline">Terms</a>
                <span>•</span>
                <a href="#" className="hover:underline">Privacy</a>
                <span>•</span>
                <a href="#" className="hover:underline">Cookies</a>
                <span>•</span>
                <a href="#" className="hover:underline">Accessibility</a>
                <span>•</span>
                <a href="#" className="hover:underline">Ads info</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// import { getPosts } from "@/actions/post.action";
// import { getDbUserId } from "@/actions/user.action";
// import CreatePost from "@/components/CreatePost";
// import PostCard from "@/components/PostCard";
// import WhoToFollow from "@/components/WhoToFollow";
// import { currentUser } from "@clerk/nextjs/server";

// export default async function Home() {
//   const user = await currentUser();
//   const posts = await getPosts();
//   const dbUserId = await getDbUserId();

//   return (
//     <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
//       <div className="lg:col-span-6">
//         {user ? <CreatePost /> : null}

//         <div className="space-y-6">
//           {posts.map((post) => (
//             <PostCard key={post.id} post={post} dbUserId={dbUserId} />
//           ))}
//         </div>
//       </div>

//       <div className="hidden lg:block lg:col-span-4 sticky top-20">
//         <WhoToFollow />
//       </div>
//     </div>
//   );
// }
