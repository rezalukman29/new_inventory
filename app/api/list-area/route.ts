import ax from '@/app/service/axios';
import axios from 'axios'
import type { NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';

type ResponseData = {
    message: string
}

export async function GET(req: NextRequest,
    res: NextApiResponse<ResponseData>
) {

    const searchParams = req.nextUrl.searchParams
    const eventId = searchParams.get('eventId')

    let response = await ax.get(
        `/v1/fix-event-list-area/${eventId}`,
        {
            headers: {
                'User-Id': 8
            }
        }
    )
        .then((response) => {
            return response;
        })
        .catch((error) => {
            return error.response;
        });

    return NextResponse.json({ data: response.data.data })
}