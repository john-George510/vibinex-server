import React, { useState } from 'react'
import Navbar from '../views/Navbar';
import Footer from '../components/Footer';
import { BsToggleOn } from 'react-icons/bs';
import { v4 as uuidv4 } from 'uuid';
import { rudderEventMethods } from "../utils/rudderstack_initialize";
import { getAuthUserId } from "../utils/auth";
import { useSession } from "next-auth/react";
import { getServerSession, Session } from "next-auth";

const Settings = () => {

	const chromeExtensionLink = "https://chrome.google.com/webstore/detail/vibinex/jafgelpkkkopeaefadkdjcmnicgpcncc";
	const list = [

		{
			name: 'Enable coverage comments',
			discription: `If enabled, you'll get coverage comments on each PR`,
			type: 'toggle',
			urlBody: 'auto_assign'

		},
		{
			name: 'Enable auto assignment',
			discription: 'If enabled, it automatically sets the reviewers for each PR',
			type: 'toggle',
			urlBody: 'coverage_comment'

		},

	];

	const [settingsList, setSettingsList] = useState(list);
	const [updateList, setUpdateList] = useState(['']);
	const session: Session | null = useSession().data;
	const userId = getAuthUserId(session);


	async function apiCall(type: string, user_id: number, bodyData: string) {
		const url = type == 'get' ? 'https://gcscruncsql-k7jns52mtq-el.a.run.app/settings' : 'https://gcscruncsql-k7jns52mtq-el.a.run.app/settings/update';
		const body = type == 'get' ? { user_id } : { user_id, settings: bodyData };

		console.log('calling server ', body, '\n [url]', url);

		try {
			let dataFromAPI;
			await fetch(url, {
				method: "POST",
				headers: {
					"Access-Control-Allow-Origin": "chrome-extension://jafgelpkkkopeaefadkdjcmnicgpcncc",
					"Content-Type": "application/json",
					"Accept": "application/json",
				},
				body: JSON.stringify(body)
			})
				.then((response) => response.json())
				.then((data) => dataFromAPI = data);
			console.log('[API SUCESS]', dataFromAPI)
			return dataFromAPI;
		} catch (e) {
			console.error(`[vibinex] Error while getting data from API. URL: ${url}, payload: ${JSON.stringify(body)}`, e);
		}
	}


	const toggleFlag = (urlBody: string) => {
		const prevUpdateList = [...updateList];
		let value: any = {};
		const index = prevUpdateList.indexOf(urlBody);
		if (index === -1) {
			prevUpdateList.push(urlBody);
			value[urlBody] = true;
		} else {
			prevUpdateList.splice(index, 1);
			value[urlBody] = false;
		}

		setUpdateList((prev) => prev = prevUpdateList);
		rudderEventMethods().then((response) => {
			response?.track(`${userId}`, "settings-changed", value, "anonymousId");
		});
	};


	async function getSettings() {
		const apiResponse = await apiCall('get', userId, '');
		console.log('[API RESPONSE]', apiResponse);
		// setSettingsList(prev => prev = apiResponse); // FixMe :  need to save the api response but api gives invalid json error 
	}

	React.useEffect(() => {
		let obj: any = {};
		list.forEach((item) => {
			obj[item.urlBody] = updateList.includes(item.urlBody);
		}
		);
		apiCall('post', userId, obj); // calling api for every time button clicked
	}, [updateList]);


	React.useEffect(() => {
		const localStorageAnonymousId = localStorage.getItem('AnonymousId');
		const anonymousId: string = (localStorageAnonymousId && localStorageAnonymousId != null) ? localStorageAnonymousId : uuidv4();

		getSettings();

		rudderEventMethods().then((response) => {
			response?.track("", "setting page called", { eventStatusFlag: 1 }, anonymousId)
		});
		localStorage.setItem('AnonymousId', anonymousId);
	}, []);

	return (
		<div>
			<div className='mb-16'>
				<Navbar ctaLink={chromeExtensionLink} transparent={true} />
			</div>
			<div id='pricing' className='w-full py-12 bg-primary-light'>
				<h2 className='font-bold text-center text-[2rem] mb-4'>Settings</h2>

				<div className='sm:w-[70%] w-[90%] m-auto sm:p-8 p-4 rounded-lg border-2'>

					{
						settingsList.map((item, index) => {
							return (
								<div key={index}
									className={`flex justify-between ${index === 0 ? '' : 'border-t-[0.1rem]'} sm:mb-4 mb-2 sm:mt-4 mt-4 sm:p-4 p-4`}
								>
									<div>
										<h1 className='sm:text-[1.3rem] text-[1rem] font-semibold'>{item.name}</h1>
										<p className='sm:text-[0.9rem] text-[0.8rem] font-light mt-1 w-[90%]'>{item.discription}</p>
									</div>
									<div onClick={() => toggleFlag(item.urlBody)} className='cursor-pointer sm:pt-2 '>
										{updateList.includes(item.urlBody) ?
											<BsToggleOn size={38} color='#2196F3' />
											:
											<BsToggleOn size={38} color='#c4c4c4' className='rotate-180' />
										}
									</div>
								</div>
							)

						})
					}

				</div>

			</div>
			<Footer />
		</div>
	)
}
export default Settings