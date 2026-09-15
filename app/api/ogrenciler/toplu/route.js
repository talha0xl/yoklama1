import { NextResponse } from "next/server";
import { supabaseServer } from "../../../../lib/supabaseServer";

// POST { grup_id, ogrenciler: [{ad_soyad, veli_adi, veli_telefon}, ...] }
export async function POST(req) {
  const body = await req.json();
  const { grup_id, ogrenciler } = body;
  if (!grup_id || !Array.isArray(ogrenciler) || ogrenciler.length === 0) {
    return NextResponse.json({ error: "Grup ve en az bir öğrenci satırı gerekli." }, { status: 400 });
  }

  const temiz = ogrenciler
    .filter((o) => o.ad_soyad && o.ad_soyad.trim())
    .map((o) => ({
      ad_soyad: o.ad_soyad.trim(),
      grup_id,
      veli_adi: o.veli_adi?.trim() || null,
      veli_telefon: o.veli_telefon?.trim() || null,
    }));

  if (temiz.length === 0) {
    return NextResponse.json({ error: "Geçerli satır bulunamadı." }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { data, error } = await supabase.from("ogrenciler").insert(temiz).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ eklenen: data.length, ogrenciler: data });
}
