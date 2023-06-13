import React from 'react'
import { useRouter } from 'next/router';
import Link from 'next/link'
import { BsSlack } from 'react-icons/bs'
import { rudderEventMethods } from '../utils/rudderstack_initialize'
import { getAndSetAnonymousIdFromLocalStorage } from '../utils/url_utils';

const JoinSlack = () => {
	const router = useRouter()
	React.useEffect(() => {
		const anonymousId = getAndSetAnonymousIdFromLocalStorage()
		
		const handleJoinSlack = () => {
			rudderEventMethods().then((response) => {
				response?.track('', "join slack", { type: "button", eventStatusFlag: 1 }, anonymousId)
			});
		}

		const joinSlackLink = document.getElementById('join-slack');
		joinSlackLink?.addEventListener('click', handleJoinSlack);

		return () => {
			joinSlackLink?.removeEventListener('click', handleJoinSlack);
		}

	}, [router])
	return (
		<div id='joinSlack' className='w-full text-center py-12  bg-black mb-[-5%]'>
			<h2 className='font-bold text-[2rem] text-white'>Slack Community</h2>
			<div className='w-[100%] mt-1 p-4 text-white'>
				<p className='text-[1.2rem]'>
					Connect with us for any help or support.<br />Join our Slack community.
				</p>
			</div>

			{/* TODO: Instead of a forever link, use this: https://github.com/thesandlord/SlackEngine */}
			<Link id='join-slack' href={'https://join.slack.com/t/vibinex/shared_invite/zt-1sysjjso3-1ftC6deRcOgQXW9hD4ozWg'} target='blank'>
				<div className='flex justify-center items-center'>
					<div className='bg-primary-main	 m-auto w-[50%] sm:p-5 p-3 px-20 rounded-lg font-bold sm:text-[25px] text-[20px] mt-5' >
						<div className='flex text-primary-light justify-center items-center'>
							<h2 className='sm:text-[1.5rem] text-[1rem] mr-4'>Join Now</h2>
							<BsSlack size={20} />
						</div>
					</div>
				</div>
			</Link>


		</div>
	)
}
export default JoinSlack