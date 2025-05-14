import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const { serverUrl, username, password } = await request.json();

    // Verifica la connessione con Xtream
    const response = await axios.get(`${serverUrl}/player_api.php`, {
      params: {
        username,
        password,
        action: 'get_live_categories'
      }
    });

    if (!response.data) {
      return NextResponse.json(
        { error: 'Credenziali Xtream non valide' },
        { status: 400 }
      );
    }

    // Salva la configurazione
    const config = await prisma.xtreamConfig.create({
      data: {
        serverUrl,
        username,
        password
      }
    });

    // Importa le categorie
    const categories = response.data;
    for (const category of categories) {
      await prisma.category.create({
        data: {
          name: category.category_name,
          id: category.category_id
        }
      });
    }

    // Importa i canali
    const channelsResponse = await axios.get(`${serverUrl}/player_api.php`, {
      params: {
        username,
        password,
        action: 'get_live_streams'
      }
    });

    for (const channel of channelsResponse.data) {
      await prisma.channel.create({
        data: {
          streamId: channel.stream_id.toString(),
          name: channel.name,
          streamUrl: `${serverUrl}/live/${username}/${password}/${channel.stream_id}.ts`,
          logoUrl: channel.stream_icon,
          categoryId: channel.category_id,
          xtreamConfigId: config.id
        }
      });
    }

    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error('Errore durante la configurazione Xtream:', error);
    return NextResponse.json(
      { error: 'Errore durante la configurazione' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const configs = await prisma.xtreamConfig.findMany({
      include: {
        channels: {
          include: {
            category: true
          }
        }
      }
    });
    return NextResponse.json(configs);
  } catch (error) {
    console.error('Errore durante il recupero delle configurazioni:', error);
    return NextResponse.json(
      { error: 'Errore durante il recupero delle configurazioni' },
      { status: 500 }
    );
  }
} 