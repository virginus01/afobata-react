import { extractStringField } from '@/app/helpers/extractStringField';
import { httpStatusCodes } from '@/app/helpers/status_codes';
import { NextRequest, NextResponse } from 'next/server';
import { authenticationIgnore, trustIgnore } from '@/app/src/constants';
import { isNull } from '@/app/helpers/isNull';
import { Brand } from '@/app/models/Brand';

//export const runtime = 'edge';

interface ParamsProps {
  endpoint: string;
  tenant?: string;
}

const isPermitted = ({
  endpoint,
  session,
  trustCode,
}: {
  endpoint: string;
  session: any;
  trustCode: any;
}) => {
  if (trustIgnore.includes(endpoint)) {
    return true;
  }

  if (!isNull(trustCode) || trustCode === process.env.NEXT_PUBLIC_TRUST_CODE) {
    return true;
  }

  if (!isNull(session)) {
    return true;
  } else {
    console.warn('No session found');
  }

  if (process.env.NODE_ENV === 'development') {
    //  return true;
  }
};

const handleRequest = async (request: NextRequest, context: { params: Promise<ParamsProps> }) => {
  const params = await context.params;
  let body: any = {};
  let _files: any = null;

  let endpoint = params.endpoint;
  const tenantId = params.tenant;

  try {
    if (!endpoint) {
      throw new Error('No endpoint received');
    }

    const { extractFields } = await import('@/app/helpers/extractFields');

    const params = await extractFields(request);

    if (request.method !== 'GET') {
      const { get_form_data } = await import('@/app/helpers/get_form_data');

      const { files, fields } = await get_form_data(request);
      body = fields;
      _files = files;
    }

    const { getAuthSessionData } = await import('@/app/controller/auth_controller');

    const session = await getAuthSessionData();

    const trustCode = request.headers.get('x-trust-code');

    const permitted = isPermitted({ session, trustCode, endpoint });

    if (!permitted) {
      const { invalid_response } = await import('@/app/helpers/invalid_response');
      return invalid_response('Not permitted to do this', 500);
    }

    let siteInfo: Brand = {} as any;

    console.info('server hit ✅ === ', request.headers.get('x-url'));

    switch (endpoint) {
      case 'api_get_views': {
        const { server_get_views } = await import('@/app/api/data');
        return server_get_views({ slug: params.slug!, table: params.table });
      }

      case 'api_get_parents': {
        const { server_get_parents } = await import('@/app/api/brand/brand');
        return server_get_parents({ brandId: params.brandId! });
      }

      case 'api_signup': {
        const { server_signup } = await import('@/app/api/auth/create');
        return server_signup({ data: body!, siteInfo: {} });
      }

      case 'api_add_update_subsidiary': {
        const { server_add_update_subsidiary } = await import('@/app/api/auth/create');
        return server_add_update_subsidiary({ body });
      }

      case 'api_query_payment': {
        const { query_payment } = await import('@/app/api/wallet_and_payments');
        return await query_payment({ ref: params.ref, context });
      }

      case 'get_info': {
        const { get_info } = await import('@/app/api/info');
        return get_info();
      }

      case 'api_credit_and_debit_ai_units': {
        const { server_credit_and_debit_ai_units } = await import('@/app/api/ai/unit');
        return server_credit_and_debit_ai_units({ body });
      }

      case 'api_query_ai': {
        const { server_query_ai } = await import('@/app/api/ai/query');
        return await server_query_ai({ body });
      }

      case 'api_get_images': {
        const { get_files } = await import('@/app/api/files/get_files');
        return get_files({ userId: params.user_id ?? '', type: params.type ?? '' });
      }

      case 'api_get_sps': {
        const { get_sps } = await import('@/app/api/sp');
        return await get_sps(params.type!, params.status!);
      }

      case 'get_user': {
        const { server_get_user } = await import('@/app/api/user');
        return await server_get_user({ context, request });
      }

      case 'api_get_logged_user': {
        const { server_get_user } = await import('@/app/api/user');
        return await server_get_user({ context, request });
      }

      case 'api_verifications': {
        const { verifications } = await import('@/app/api/verifications');
        return await verifications(params.id!, params.spId!, params.type!);
      }

      case 'api_get_banks': {
        const { fetchBanks } = await import('@/app/api/paystack');
        return await fetchBanks();
      }

      case 'api_get_orders_by_ref': {
        const { get_orders_by_ref } = await import('@/app/api/order');
        return await get_orders_by_ref(params.ref);
      }

      case 'query_order': {
        const { query_orders } = await import('@/app/api/order');
        return query_orders({ id: params.id! });
      }

      case 'api_get_brand': {
        const { server_get_site_info } = await import('@/app/api/brand/brand');
        return server_get_site_info(context, true, request);
      }

      case 'api_get_options': {
        const { server_get_options } = await import('@/app/api/options/option');
        return server_get_options(context);
      }

      case 'api_get_user_brand': {
        const { server_get_user_brand } = await import('@/app/api/brand/brand');
        return server_get_user_brand({ userId: params.user_id! });
      }

      case 'callback': {
        const { callback } = await import('@/app/api/data');
        return callback(params.target);
      }

      case 'api_get_ip_info': {
        const { server_get_ip_info } = await import('@/app/api/info');
        return server_get_ip_info(params.ip!);
      }

      case 'api_get_site_keys': {
        const { get_keys } = await import('@/app/api/info');
        return get_keys('site');
      }

      case 'api_get_keys': {
        const { get_keys } = await import('@/app/api/info');
        return get_keys(String(params.type));
      }

      case 'get_users': {
        const { get_users } = await import('@/app/api/user');
        return get_users();
      }

      case 'api_get_csrf': {
        const csrfModule = await import('@/app/security/get_csrf');
        return csrfModule.default();
      }

      case 'get_location_data': {
        const { server_get_geo } = await import('@/app/api/geo');
        return server_get_geo(request);
      }

      case 'api_get_files': {
        const { get_files } = await import('@/app/api/files/get_files');
        return get_files({ userId: params.user_id! });
      }

      case 'api_dynamic_get_data': {
        const { server_dynamic_get_data } = await import('@/app/api/data');
        return server_dynamic_get_data({
          table: params.table!,
          conditions: params.conditions!,
          limit: params.limit,
          page: params.page,
          tables: params.tables!,
          sortOptions: params.sortOptions,
          renderPage: await extractStringField(request, 'renderPage'),
          essentials: (await extractStringField(request, 'essentials')) as any,
        });
      }

      case 'api_get_wallet': {
        const { get_wallet } = await import('@/app/api/wallet_and_payments');
        return get_wallet({
          id: params.id!,
          userId: params.user_id!,
          identifier: params.type as any,
          currency: params.currency,
        });
      }

      case 'api_get_wallets': {
        const { get_wallets } = await import('@/app/api/wallet_and_payments');
        return get_wallets({
          brandId: params.brandId!,
          userId: params.user_id!,
          identifier: params.type!,
          isDefault: params.isDefault,
        });
      }

      case 'ping_brand': {
        const { server_ping_brand } = await import('@/app/api/brand/brand');
        return server_ping_brand(params.id!);
      }

      case 'api_refresh_domain_status': {
        const { server_refresh_domain_status } = await import('@/app/api/domains/domain');
        return server_refresh_domain_status();
      }

      case 'api_refresh_views': {
        const { server_refresh_views } = await import('@/app/api/data');
        return server_refresh_views({
          userId: params.user_id!,
        });
      }

      case 'api_user_stats': {
        const { server_user_stats } = await import('@/app/api/user');
        return server_user_stats({
          userId: params.user_id!,
          brandId: params.brandId!,
          duration: params.duration!,
        });
      }

      case 'api_get_product': {
        const { get_product } = await import('@/app/api/product');
        return await get_product({
          id: params.id,
          context: context,
        });
      }

      case 'api_get_post': {
        const { get_post } = await import('@/app/api/blog/blog');
        return await get_post({
          id: params.id,
          userId: params.user_id!,
          tenantId: tenantId!,
          context: context,
        });
      }

      case 'api_create_order': {
        const { server_create_or_update_order } = await import('@/app/api/order');
        return await server_create_or_update_order(body, context);
      }

      case 'api_create_payment': {
        const { server_create_payment } = await import('@/app/api/wallet_and_payments');
        return await server_create_payment(body);
      }

      case 'api_create_va': {
        const { create_va } = await import('@/app/api/wallet_and_payments');
        return await create_va(body);
      }

      case 'api_update_order': {
        const { server_update_order } = await import('@/app/api/order');
        return await server_update_order(body);
      }

      case 'api_get_product_by_pin': {
        const { server_get_product_by_pin } = await import('@/app/api/product');
        return await server_get_product_by_pin(params.id);
      }

      case 'api_get_products': {
        const { get_products } = await import('@/app/api/product');
        return await get_products({
          user_id: params.user_id,
          type: params.type!,
          spId: params.spId!,
          page: params.page,
          limit: params.limit,
          context: context,
          ignore_brand_add: params.ignore_brand_add,
          mbi: params.mbi,
          conditions: params.conditions,
        });
      }

      case 'api_get_posts': {
        const { get_posts } = await import('@/app/api/blog/blog');
        return await get_posts({
          user_id: params.user_id,
          type: params.type!,
          spId: params.spId!,
          page: params.page,
          limit: params.limit,
          context: context,
        });
      }

      case 'api_create_update_brand': {
        const { server_create_update_user_brand } = await import('@/app/api/brand/brand');
        return await server_create_update_user_brand({
          data: body!,
          siteInfo: siteInfo as any,
        });
      }

      case 'api_update_views': {
        const { server_update_views } = await import('@/app/api/data');
        return await server_update_views({ data: body!, request });
      }

      case 'api_get_addons': {
        const { server_get_addons } = await import('@/app/api/packages_and_addons/addons');
        return await server_get_addons({ userId: params.user_id!, id: params.id! });
      }

      case 'api_get_packages': {
        const { server_get_plans } = await import('@/app/api/packages_and_addons/packages');
        return await server_get_plans({ userId: params.user_id!, id: params.id! });
      }

      case 'api_create_and_update_addon': {
        const { server_create_and_update_addon } = await import(
          '@/app/api/packages_and_addons/addons'
        );
        return await server_create_and_update_addon(body);
      }

      case 'api_create_and_update_package': {
        const { server_create_and_update_plan } = await import(
          '@/app/api/packages_and_addons/packages'
        );
        return await server_create_and_update_plan(body);
      }

      case 'api_import_products': {
        const { server_import_product } = await import('@/app/api/product');
        return await server_import_product(body, context);
      }

      case 'api_get_currencies': {
        const { server_get_currencies } = await import('@/app/api/currency/currency');
        return await server_get_currencies({
          conditions: params.conditions,
          limit: params.limit!,
          page: params.page,
        });
      }

      case 'api_get_exchange_rates': {
        const { server_get_exchange_rates } = await import('@/app/api/currency/currency');
        return await server_get_exchange_rates();
      }

      case 'api_update_info': {
        const { update_info } = await import('@/app/api/info');
        return await update_info(body);
      }

      case 'api_send_mail': {
        const { server_send_mail } = await import('@/app/api/mail/send_mail');
        return server_send_mail({ formData: body, siteInfo: {} });
      }

      case 'api_generate_user_token': {
        const { server_generate_user_token } = await import('@/app/api/user');
        return server_generate_user_token({ formData: body, siteInfo: {} });
      }

      case 'api_withdraw_revenue': {
        const { server_withdraw_revenue } = await import('@/app/api/revenue/revenue');
        return server_withdraw_revenue(body, context);
      }

      case 'approve-transfer': {
        const { approve_transfer } = await import('@/app/api/wallet_and_payments');
        return approve_transfer(body);
      }

      case 'api_user_account_verifications': {
        const { server_user_account_verifications } = await import('@/app/api/user');
        return server_user_account_verifications(body);
      }

      case 'api_add_user_bank_details': {
        const { server_add_user_bank_details } = await import('@/app/api/user');
        return server_add_user_bank_details(body);
      }

      case 'api_brand_domain_connection': {
        const { server_brand_domain_connection } = await import('@/app/api/domain');
        return server_brand_domain_connection(body);
      }

      case 'api_custom_domain_actions': {
        const { server_custom_domain_actions } = await import('@/app/api/domain');
        return server_custom_domain_actions(body);
      }

      case 'api_brand_setup': {
        const { server_brand_setup } = await import('@/app/api/brand/brand');
        return server_brand_setup({ body });
      }

      case 'api_add_or_update_domain': {
        const { server_add_or_update_domain } = await import('@/app/api/domains/domain');
        return server_add_or_update_domain(body);
      }

      case 'api_create_subscription': {
        const { server_create_sub } = await import('@/app/api/plan/plan');
        return server_create_sub({ formData: body });
      }

      case 'api_save_cookie': {
        const { post_callback } = await import('../../post/[action]/callback');
        return post_callback({ body: body });
      }

      case 'api_change_order_status': {
        const { server_change_order_status } = await import('@/app/api/order');
        return server_change_order_status({ body: body });
      }

      case 'api_create_user': {
        const { server_create_user } = await import('@/app/api/user');
        return server_create_user({ formData: body, siteInfo: {} });
      }

      case 'api_update_user': {
        const { server_update_user } = await import('@/app/api/user');
        return server_update_user({ formData: body });
      }

      case 'api_update_auth': {
        const { server_update_auth } = await import('@/app/api/auth/create');
        return server_update_auth({ formData: body, siteInfo: {} });
      }

      case 'api_order_action': {
        const { server_order_action } = await import('@/app/api/order');
        return server_order_action({ body: body });
      }

      case 'crud_patch': {
        const { crud_edge_patch } = await import('../../patch/crud_edge_patch');
        return crud_edge_patch({ body, siteInfo: {} });
      }

      case 'crud_put': {
        const { crud_edge_put } = await import('../../patch/crud_edge_put');
        return crud_edge_put({ body, siteInfo: {} });
      }

      case 'crud_delete': {
        const { crud_edge_delete } = await import('../../patch/crud_edge_delete');
        return crud_edge_delete({ body, siteInfo: {} });
      }

      default:
        const { response } = await import('@/app/helpers/response');
        console.error(endpoint, ' Not found');
        return response({
          status: false,
          msg: 'No valid route',
          statusCode: httpStatusCodes[500],
          data: {},
        });
    }
  } catch (err: any) {
    const { invalid_response } = await import('@/app/helpers/invalid_response');

    return invalid_response(err.message || 'Unknown server error', 500);
  }
};

// Route handlers
export async function GET(request: NextRequest, context: any) {
  return await handleRequest(request, context);
}

export async function POST(request: NextRequest, context: any) {
  return await handleRequest(request, context);
}

export async function PUT(request: NextRequest, context: any) {
  return await handleRequest(request, context);
}

export async function PATCH(request: NextRequest, context: any) {
  return await handleRequest(request, context);
}

export async function DELETE(request: NextRequest, context: any) {
  return await handleRequest(request, context);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
